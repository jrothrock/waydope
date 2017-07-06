class Api::V1::Sellers::SellersController < ApplicationController
	def index
        offset = request.headers["offset"] && request.headers["offset"].to_i % 1 ? request.headers["offset"].to_i : 0
        puts offset
        user = User.find_by_token(request.headers["Authorization"].split(' ').last)
        page = (offset / 5) + 1
        if user
            seller = Seller.where('user_id = ?', user.id).first
            if !seller
                seller = Seller.new
                seller.user_id = user.id
                seller.save
            end 
            #the sales come in backward, so we need to reverse the hash - to do so, we have to change it into an array then back into a hash
            sales_hash = Hash[seller.sales.to_a.reverse]
            count = sales_hash.length
            pages = (count.to_f / 5.0).ceil
            sales_array = []
            if sales_hash.keys.length > 5 
                sales_hash.keys[(0 + (5 *(offset/5 )))..(offset+4)].each{|key| sales_array << sales_hash[key]} 
            else
                sales_hash.keys[0..(sales_hash.length - 1)].each{|key| sales_array << sales_hash[key]} 
            end
            sales_array.each do |sale_hash|
                sale_hash.each do |id, value|
                    value.each do |size,value1|
                        value1.each do |color,value2|
                            sale_hash[id][size][color]["time_ago"] = time_ago_in_words(sale_hash[id][size][color]["time"]) 
                            sale_hash[id][size][color]["date"]=DateTime.parse(sale_hash[id][size][color]["time"]).strftime("%m/%d/%Y - %I:%M%p")
                        end
                    end
                end
            end
            seller.sales = sales_array
            seller = seller.as_json
            seller["total_sales"] = number_to_currency(seller["total_sales"])
            seller["total_sub"] = number_to_currency(seller["total_sub"])
            seller["total_shipping"] = number_to_currency(seller["total_shipping"])
            seller["total_tax"] = number_to_currency(seller["total_tax"])
            render json:{status:200, success:true, seller:seller, count:count,offset:offset,page:page,pages:pages}
        else
            render json:{status:401, success:false}
        end
    end
    def read
        user = User.find_by_token(request.headers["Authorization"].split(' ').last)
        if user
            seller = Seller.where('user_id = ?', user.id).first
            sales_hash = seller ? seller.sales : nil
            if sales_hash && sales_hash[request.headers["order"]] && sales_hash[request.headers["order"]][request.headers["product"]] && sales_hash[request.headers["order"]][request.headers["product"]][request.headers["size"]] && sales_hash[request.headers["order"]][request.headers["product"]][request.headers["size"]][request.headers["color"]]
                sale = sales_hash[request.headers["order"]][request.headers["product"]][request.headers["size"]][request.headers["color"]]
            end 
            if !seller || !sale
               render json:{status:404, success:false}
               return false
            end 
            render json:{status:200, success:true, sale:sale}
        else
            render json:{status:401, success:false}
        end
    end
    def update
        user = User.find_by_token(request.headers["Authorization"].split(' ').last)
        if user
            seller = Seller.where('user_id = ?', user.id).first
            sales_hash = seller ? seller.sales : nil
            if sales_hash && sales_hash[params[:id]] && sales_hash[params[:id]][params[:product]] && sales_hash[params[:id]][params[:product]][params[:size]] && sales_hash[params[:id]][params[:product]][params[:size]][params[:color]]
                sale = sales_hash[params[:id]][params[:product]][params[:size]][params[:color]]
            end 
            order = params[:id] ? Order.where('uuid = ?',params[:id]).first : nil
            if !seller || !sale || !order
                render json:{status:404, success:false}
                return false
            end 
            sale["confirmation"] = params[:code]
            shipping_hash = order.shipping_confirmations
            length = shipping_hash.length

            ### these looping basterds need to be refined.
            if shipping_hash.key?([params[:id]])
                if shipping_hash[params[:id]].key?(params[:product])
                    if shipping_hash[params[:id]][params[:product]].key?(params[:size])
                        if !shipping_hash[params[:id]][params[:product]][params[:size]].key?(params[:color])
                            shipping_hash[params[:id]][params[:product]][params[:size]][params[:color]] = {}
                        end
                    else
                        shipping_hash[params[:id]][params[:product]][params[:size]] = {}
                        shipping_hash[params[:id]][params[:product]][params[:size]][params[:color]] = {}
                    end
                else
                    shipping_hash[params[:id]][params[:product]] = {}
                    shipping_hash[params[:id]][params[:product]][params[:size]] = {}
                    shipping_hash[params[:id]][params[:product]][params[:size]][params[:color]] = {}
                end

            else
                shipping_hash[params[:id]] = {}
                shipping_hash[params[:id]][params[:product]] = {}
                shipping_hash[params[:id]][params[:product]][params[:size]] = {}
                shipping_hash[params[:id]][params[:product]][params[:size]][params[:color]] = {}
            end
        
            shipping_hash[params[:id]][params[:product]][params[:size]][params[:color]] = {
                "confirmation" => params[:code],
                "shipping_type" => sale["shipping_type"],
                "title" => sale["title"],
                "picture" => sale["picture"],
                "category" => sale["category"],
                "sub_category" => sale["sub_category"],
                "quantity" => sale["quantity"],
                "type" => sale["type"],
                "total" => sale["total"],
                "sub_total" => sale["sub_total"],
                "shipping" => sale["shipping"],
                "tax" => sale["tax"],
                "url" => sale["url"]
            }
            order.shipping_confirmations = shipping_hash
            seller.sales = sales_hash
            if !order.new_shipping
                order.tracker_sent = Time.now
            end
            order.new_shipping = true
            order.new_shipping_notification = true
            order.tracker_updated = Time.now
            if order.save && seller.save
                render json:{status:200, success:true, sale:sale}
                ShipnotificationWorker.perform_async(sale,order.id,params[:product],params[:size],params[:color],params[:code])
            else 
                render json:{status:500, success:false}
            end
        else
            render json:{status:401, success:false}
        end
    end
end
