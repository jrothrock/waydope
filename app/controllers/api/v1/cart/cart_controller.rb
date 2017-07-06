require 'csv'
# http://money.stackexchange.com/questions/15051/sales-tax-rounded-then-totaled-or-totaled-then-rounded
# here's a good question on how to correctly do taxes, currently it is only tangible assets, so everything is taxed as such.
include ActionView::Helpers::NumberHelper
class Api::V1::Cart::CartController < ApplicationController
    include ActionView::Helpers::NumberHelper
    def read
        #
        # The first one joins it, while the second one errors for too many columns. 
        # It would ideal if it would just substitute the products column - originally full of id's with the actual records.
        #
       # sanitized_query = request.headers["cart"] ? Order.escape_sql(["SELECT o.*, p.* FROM orders o LEFT JOIN products p ON p.id = ANY((jsonb_object_keys(o.quantities)::text[])::integer[]) WHERE o.uuid = ? AND o.quantities::TEXT <> NULL",request.headers["cart"]]) : nil
        # sanitized_query = request.headers["cart"] ? Notification.escape_sql(["SELECT o.*, ( SELECT p.* FROM products p WHERE p.id = ANY(o.products::int[])) products FROM orders o WHERE o.id = ?", request.headers["cart"]]) : nil
        #order_test = Order.find_by_sql(sanitized_query)
        order = request.headers["cart"] ? Order.where('uuid = ?', request.headers["cart"]).first : nil

        if order
            if order.user_uuid then user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil end
            if order.user_uuid && user && user.uuid != order.user_uuid
                render json:{status:401, success:false}
                return false
            end
            puts order.quantities
            # puts order.quantities.key
            products = order.properties ? Product.where('uuid IN (?)', order.properties.keys).select_with(App.getGoodColumns('apparel')).as_json(include: :photos).to_a : ni
            order.products = [] # turn object into an array so we can add the products.
                # we're looping again... Not very good. 
            products.each do |product|
                product["price"] = number_to_currency(product["price"])
				product["sale_price"] = number_to_currency(product["sale_price"])
				product["shipping"] = number_to_currency(product["shipping"])
                order.products << product
            end
            order = order.as_json
            order["total"] = number_to_currency(order["total"])
            order["sub_total"] = number_to_currency(order["sub_total"])
            order["shipping"] = number_to_currency(order["shipping"])
            order["tax"] = number_to_currency(order["tax"])
            order["properties"].each do |id,value|
                order["properties"][id].each do |size, value|
                    order["properties"][id][size].each do |color,value|
                        order["properties"][id][size][color]["price"] = number_to_currency(order["properties"][id][size][color]["price"])
                        order["properties"][id][size][color]["tax"] = number_to_currency(order["properties"][id][size][color]["tax"])
                        order["properties"][id][size][color]["total"] = number_to_currency(order["properties"][id][size][color]["total"])
                        order["properties"][id][size][color]["shipping"] = number_to_currency(order["properties"][id][size][color]["shipping"])
                        order["properties"][id][size][color]["sub_total"] = number_to_currency(order["properties"][id][size][color]["sub_total"])
                    end
                end
            end
            render json:{status:200, success:true, order:order, products:products}
        else
            render json:{status:404, success:false}
        end
    end
    def create
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        order = Order.new
        order.quantities = {}
        order.taxes = {}
        order.shippings = {}
        order.totals = {}
        order.sub_totals = {}
        order.properties = {}
        order.uuid = Order.setUUID
        products = params[:items] ? Product.where('uuid IN (?)', params[:items]).select_with(App.getGoodColumns('apparel')) : nil
        approved = products.map(&:approved)
        if approved.include?(false)
            render json:{status:409, success:false, message:"Can't add items to the cart that haven't been approved."}
            return false
        end
        quantity = params[:quantities] && params[:quantities].length ? params[:quantities].length : 1
        sizes = params[:sizes] 
        colors = params[:colors]
        quantities = params[:quantities]
        tax_rate = 0
        if user && user.email then order.email = user.email end
        if user && user.zip 
            if (user.zip > 80000 && user.zip < 81658)
                # probably shouldn't load the entire thing into memory, but it's small so whatever.
                csv = CSV.read("#{Rails.root}/lib/assets/TAXRATES_ZIP5_CO201703.csv", :headers=>true)
                index = csv['ZipCode'].index(user.zip.to_s)
                if index
                    tax_rate = csv[index]["EstimatedCombinedRate"].to_f
                    order.tax_rate = tax_rate
                end
            end
            order.zip_checked = true
        end
        if products.length === params[:quantities].length && products.length > 0 && products.length === params[:colors].length && products.length === params[:sizes].length
            quantity.times do |time|
                product = products[time]
                begin
                    q = quantities && quantities[time] && quantities[time] != '1' && quantities[time] != 1 ? Integer(quantities[time],10) : 1
                    rescue
                        render json:{status: 400, success:false, message:'quantity needs to be a number - (can be either an integer or string)'} 
                        return false
                end
                begin
                    if quantities[time].to_i >  product.properties[sizes[time]][colors[time]]["quantity"].to_i
                        render json:{status:409, success:false, message:"#{product.title.to_s + ', ' + sizes[time].to_s + ', ' + colors[time].to_s} only has #{product.properties[sizes[time]][colors[time]]["quantity"]} remaining. You provided: #{quantities[time]}"}
                        return false
                    end
                    rescue => e
                        render json:{status:400, success:false, message:"the size and/or color you provided does not exist on that product"}
                        return false
                end
                quantity_hash = {}
                quantity_hash[sizes[0]] = {}
                quantity_hash[sizes[0]][colors[0]] = q
                order.quantities = quantity_hash



                if tax_rate
                    price = product.properties[sizes[time]][colors[time]]["price"].to_f
                    tax_hash =  order.taxes
                    puts product.as_json
                    puts product.uuid
                    tax_hash[product.uuid.to_s] = {}
                    tax_hash[product.uuid.to_s][sizes[time]] = {}
                    tax_hash[product.uuid.to_s][sizes[time]][colors[time]] = (q.to_f * (((((product.shipping.to_f + price.to_f) * tax_rate.to_f)+0.0001)*100)/100).round(2)).round(2)
                    order.taxes = tax_hash
                end
                shippings = order.shippings
                sub_totals = order.sub_totals
                totals = order.totals
                sub_total = 0
                shipping = 0
                tax = 0
                q.times do |i|
                    price = product.properties[sizes[time]][colors[time]]["price"].to_f
                    order.sub_total += price
                    sub_total += price
                    order.shipping += product.shipping
                    shipping += product.shipping
                    order.tax += tax_rate ? ((((((product.shipping.to_f + price.to_f) * tax_rate.to_f)+0.0001)*100)/100).round(2)).round(2) : 0
                    tax += tax_rate ? ((((((product.shipping.to_f + price.to_f) * tax_rate.to_f)+0.0001)*100)/100).round(2)).round(2) : 0
                end

                total = sub_total.to_f + shipping.to_f + tax.to_f
            
                shippings[product.uuid.to_s]= {}
                shippings[product.uuid.to_s][sizes[time]] = {}
                shippings[product.uuid.to_s][sizes[time]][colors[time]] = shipping
                
                totals[product.uuid.to_s] = {}
                totals[product.uuid.to_s][sizes[time]] = {}
                totals[product.uuid.to_s][sizes[time]][colors[time]] = total
  
                sub_totals[product.uuid.to_s] = {}
                sub_totals[product.uuid.to_s][sizes[time]] = {}
                sub_totals[product.uuid.to_s][sizes[time]][colors[time]] = sub_total

                order.shippings = shippings
                order.totals = totals
                order.sub_totals = sub_totals

                properties_hash = order.properties
                properties_hash[product.uuid.to_s]={}
                properties_hash[product.uuid.to_s][sizes[time]]={}
                properties_hash[product.uuid.to_s][sizes[time]][colors[time]]={}
                properties_hash[product.uuid.to_s][sizes[time]][colors[time]]["quantity"] = params[:quantities][time]
                properties_hash[product.uuid.to_s][sizes[time]][colors[time]]["price"] = product.properties[sizes[time]][colors[time]]["price"].to_f
                properties_hash[product.uuid.to_s][sizes[time]][colors[time]]["tax"] = tax
                properties_hash[product.uuid.to_s][sizes[time]][colors[time]]["total"] = total
                properties_hash[product.uuid.to_s][sizes[time]][colors[time]]["shipping"] = shipping
                properties_hash[product.uuid.to_s][sizes[time]][colors[time]]["sub_total"] = sub_total
                order.properties = properties_hash
                # puts order.as_json
            end
            order.user_uuid = user && user.uuid ? user.uuid : nil
            order.total = order.sub_total.to_f + order.shipping.to_f + order.tax.to_f
            if order.save
                order = order.as_json
                order["total"] = number_to_currency(order["total"])
                order["sub_total"] = number_to_currency(order["sub_total"])
                order["shipping"] = number_to_currency(order["shipping"])
                order["tax"] = number_to_currency(order["tax"])
                order["properties"].each do |id,value|
                    order["properties"][id].each do |size, value|
                        order["properties"][id][size].each do |color,value|
                            order["properties"][id][size][color]["price"] = number_to_currency(order["properties"][id][size][color]["price"])
                            order["properties"][id][size][color]["tax"] = number_to_currency(order["properties"][id][size][color]["tax"])
                            order["properties"][id][size][color]["total"] = number_to_currency(order["properties"][id][size][color]["total"])
                            order["properties"][id][size][color]["shipping"] = number_to_currency(order["properties"][id][size][color]["shipping"])
                            order["properties"][id][size][color]["sub_total"] = number_to_currency(order["properties"][id][size][color]["sub_total"])
                        end
                    end
                end
                render json:{status:200, success:true, order:order}
            else
                render json:{status:500, success:false}
                Rails.logger.info(order.errors.inspect)
            end
        else
            render json:{status:400, success:false, message:'Items parameter is required. Item ids need to be in an array and the items array needs to be the same length as the quantities, colors, and sizes, array.'}
        end
    end
    def update
        product = Product.where("uuid = ?", params[:item]).first
        cart = request.headers["cart"] ? request.headers["cart"] : params[:cart]
        order = cart ? Order.where('uuid = ?', request.headers["cart"]).first : nil
        puts request.headers['cart']
        puts order
        if order

            if params[:update_zip]
                if params[:zip]
                    if params[:zip].to_i > 80000 && params[:zip].to_i < 81658 && (order.tax_rate === 0 && order.tax === 0)
                        csv = CSV.read("#{Rails.root}/lib/assets/TAXRATES_ZIP5_CO201703.csv", :headers=>true)
                        index = csv['ZipCode'].index(params[:zip].to_s)
                        if index
                            tax_rate = csv[index]["EstimatedCombinedRate"].to_f
                        end
                        properties_hash = order.properties
                        products = Product.select_with(App.getGoodColumns('apparel')).where("uuid IN (?)", properties_hash.keys).as_json(includes: :photos).to_a
                        tax = 0
                        tax_hash = {}
                        order.properties.map do |id,value|
                            product = products.detect {|p| p["uuid"].to_s === id.to_s}
                            tax_hash[id]={}
                            value.each do |size,value1|
                                tax_hash[id][size]={}
                                value1.each do |color,value2|
                                    quantity = value2["quantity"].to_i
                                    price = product["properties"][size][color]["price"].to_f
                                    tax = (quantity * (((((product["shipping"].to_f + price.to_f) * tax_rate.to_f)+0.0001)*100)/100).round(2)).round(2)
                                    new_total = tax + order["properties"][id][size][color]["total"]
                                    tax_hash[id][size][color]= tax
                                    order.tax += tax_rate ? tax_hash[id][size][color] : 0
                                    order["properties"][id][size][color]["tax"]= tax
                                    order["properties"][id][size][color]["total"] = new_total
                                    product["price"] = number_to_currency(product["price"])
                                    product["sale_price"] = number_to_currency(product["sale_price"])
                                    product["shipping"] = number_to_currency(product["shipping"])
                                    product["properties"].each do |key,value|
                                        value.each do |key1,value1|
                                            value1["price"] = number_to_currency(value1["price"])
                                        end
                                    end
                                end
                            end
                        end
                        
                        order.tax_rate = tax_rate
                        order.taxes = tax_hash
                        order.total = order.shipping.to_f + order.sub_total.to_f + order.tax.to_f
                        order.zip_checked = true
                        order.zip = params[:zip]
                        order.save
                        order = order.as_json
                        order["total"] = number_to_currency(order["total"])
                        order["sub_total"] = number_to_currency(order["sub_total"])
                        order["shipping"] = number_to_currency(order["shipping"])
                        order["tax"] = number_to_currency(order["tax"])
                        order["properties"].each do |id,value|
                            value.each do |size,value1|
                                value1.each do |color, value2|
                                    order["properties"][id][size][color]["price"] = number_to_currency(order["properties"][id][size][color]["price"])
                                    order["properties"][id][size][color]["tax"] = number_to_currency(order["properties"][id][size][color]["tax"])
                                    order["properties"][id][size][color]["total"] = number_to_currency(order["properties"][id][size][color]["total"])
                                    order["properties"][id][size][color]["shipping"] = number_to_currency(order["properties"][id][size][color]["shipping"])
                                    order["properties"][id][size][color]["sub_total"] = number_to_currency(order["properties"][id][size][color]["sub_total"])
                                end
                            end
                        end
                        render json:{status:200, success:true, order:order, products:products}
                    else
                        order.zip_checked
                        order.save
                        render json:{status:200, success:true}
                    end
                    return
                else
                    render json:{status:400, success:false, message:"zip param is required"}
                end
            end
            

            if order.user_uuid
                user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
                if user && user.uuid != order.user_uuid
                    render json:{status:401,success:false}
                    return false
                end
                if user && user.zip 
                    if (user.zip > 80000 && user.zip < 81658)
                        # probably shouldn't load the entire thing into memory, but it's small so whatever.
                        csv = CSV.read("#{Rails.root}/lib/assets/TAXRATES_ZIP5_CO201703.csv", :headers=>true)
                        index = csv['ZipCode'].index(user.zip.to_s)
                        if index
                            tax_rate = csv[index]["EstimatedCombinedRate"].to_f
                        end
                        order.zip_checked = true
                    end
                end
            end

            if params[:quantity] && params[:quantity] != '0' && params[:quantity] != 0    
                begin
                    q = params[:quantity] && params[:quantity] != '1' && params[:quantity] != 1 ? Integer(params[:quantity],10) : 1
                    rescue
                        render json:{status: 400, success:false, message:'quantity needs to be a number - (can be either an integer or string)'} 
                        return false
                end
            else 
                q = 0
            end

            begin
                # leave the if in this order, as it's used to check whether the user sent in the correct params will 
                if params[:quantity].to_i > product.properties[params[:size]][params[:color]]["quantity"].to_i && q != 0
                    render json:{status:400, success:false, message:"quantity selected is greater than the products currrent quantity"}
                    return false
                end
            rescue => exception
               puts exception
               render json:{status:400, success:false, message:"size and color need to be actually properties of the product."}  
               return false
            end
            puts order.quantities
            puts q
            quantity_hash = order.quantities
            # if quantity_hash.key?(product.uuid.to_s)
            #     amount = quantity_hash[product.uuid.to_s].to_i
            #     puts amount
            #     price = product.properties[params[:size]][params[:color]]["price"
            #     amount.times do |i|
            #         order.sub_total -= price
            #         order.shipping -= product.shipping
            #     end
            #     order.tax -= tax_rate ? (quantity_hash[product.uuid.to_s].to_f * (((((product.shipping.to_f + price.to_f) * tax_rate.to_f)+0.0001)*100)/100).round(2)).round(2) : 0
            # end
            properties_hash = order.properties
            if properties_hash && properties_hash[product.uuid.to_s] && properties_hash[product.uuid.to_s][params[:size]] && properties_hash[product.uuid.to_s][params[:size]][params[:color]]
                
                amount = properties_hash[product.uuid.to_s][params[:size]][params[:color]]["quantity"].to_i
                puts 'amount'
                puts amount
                price = product.properties[params[:size]][params[:color]]["price"].to_f
                amount.times do |i|
                    order.sub_total -= price
                    order.shipping -= product.shipping
                end
                order.tax -= tax_rate ? (amount * (((((product.shipping.to_f + price.to_f) * tax_rate.to_f)+0.0001)*100)/100).round(2)).round(2) : 0
                order.total = order.sub_total + order.shipping + order.tax
            end
            if q != 0
                if tax_rate
                    price = product.properties[params[:size]][params[:color]]["price"].to_f
                    tax_hash = order.taxes
                    if tax_hash.key?(product.uuid.to_s)
                        if !tax_hash[product.uuid.to_s].key?(params[:size])
                             tax_hash[product.uuid.to_s][params[:size]] = {}
                        end
                    else
                        tax_hash[product.uuid.to_s] = {}
                        tax_hash[product.uuid.to_s][params[:size]] = {}
                    end
                    tax_hash[product.uuid.to_s][params[:size]][params[:color]] = (q.to_f * (((((product.shipping.to_f + price.to_f) * tax_rate.to_f)+0.0001)*100)/100).round(2)).round(2)
                    # tax_hash[product.uuid.to_s] = (q.to_f * (((((product.shipping.to_f + price.to_f) * tax_rate.to_f)+0.0001)*100)/100).round(2)).round(2)
                    order.taxes = tax_hash
                end
                if quantity_hash.key?(product.uuid.to_s)
                    if !quantity_hash[product.uuid.to_s].key?(params[:size])
                        quantity_hash[product.uuid.to_s][params[:size]] = {}
                    end
                else
                    quantity_hash[product.uuid.to_s] ={}
                    quantity_hash[product.uuid.to_s][params[:size]] = {}
                end
                quantity_hash[product.uuid.to_s][params[:size]][params[:color]] = q
                order.quantities = quantity_hash
                ## order.tax -- needs to be done.
                shippings = order.shippings
                sub_totals = order.sub_totals
                totals = order.totals
                sub_total = 0
                shipping = 0
                tax = 0
                q.times do |i|
                    price = product.properties[params[:size]][params[:color]]["price"].to_f
                    order.sub_total += price
                    sub_total += price
                    order.shipping += product.shipping
                    shipping += product.shipping
                    order.tax +=  tax_rate ? ((((((product.shipping.to_f + price.to_f) * tax_rate.to_f)+0.0001)*100)/100).round(2)).round(2) : 0
                    tax +=  tax_rate ? ((((((product.shipping.to_f + price.to_f) * tax_rate.to_f)+0.0001)*100)/100).round(2)).round(2) : 0
                end
                total = shipping.to_f + sub_total.to_f + tax.to_f

                if shippings.key?(product.uuid.to_s)
                    if !shippings[product.uuid.to_s].key?([params[:size]])
                        shippings[product.uuid.to_s][params[:size]] ={}
                    end
                else
                    shippings[product.uuid.to_s] ={}
                    shippings[product.uuid.to_s][params[:size]] ={}
                end
                shippings[product.uuid.to_s][params[:size]][params[:color]] = shipping
                
                 if sub_totals.key?(product.uuid.to_s)
                    if !sub_totals[product.uuid.to_s].key?([params[:size]])
                        sub_totals[product.uuid.to_s][params[:size]] ={}
                    end
                else
                    sub_totals[product.uuid.to_s] ={}
                    sub_totals[product.uuid.to_s][params[:size]] ={}
                end
                sub_totals[product.uuid.to_s][params[:size]][params[:color]] = shipping

                 if totals.key?(product.uuid.to_s)
                    if !totals[product.uuid.to_s].key?([params[:size]])
                        totals[product.uuid.to_s][params[:size]] ={}
                    end
                else
                    totals[product.uuid.to_s] ={}
                    totals[product.uuid.to_s][params[:size]] ={}
                end
                totals[product.uuid.to_s][params[:size]][params[:color]] = shipping

                order.shippings = shippings
                order.totals = totals
                order.sub_totals = sub_totals

                properties_hash = order.properties
                if properties_hash.key?(product.uuid.to_s)
                    if properties_hash[product.uuid.to_s].key?(params[:size])
                        properties_hash[product.uuid.to_s][params[:size]][params[:color]] = {}
                    else
                        properties_hash[product.uuid.to_s][params[:size]] ={}
                        properties_hash[product.uuid.to_s][params[:size]][params[:color]] = {}
                    end
                else
                    properties_hash[product.uuid.to_s] = {}
                    properties_hash[product.uuid.to_s][params[:size]] ={}
                    properties_hash[product.uuid.to_s][params[:size]][params[:color]] = {}
                end
                properties_hash[product.uuid.to_s][params[:size]][params[:color]]["quantity"] = params[:quantity]
                properties_hash[product.uuid.to_s][params[:size]][params[:color]]["price"] = product.properties[params[:size]][params[:color]]["price"].to_f
                properties_hash[product.uuid.to_s][params[:size]][params[:color]]["tax"] = tax
                properties_hash[product.uuid.to_s][params[:size]][params[:color]]["total"] = total
                properties_hash[product.uuid.to_s][params[:size]][params[:color]]["shipping"] = shipping
                properties_hash[product.uuid.to_s][params[:size]][params[:color]]["sub_total"] = sub_total
                order.properties = properties_hash
            elsif q === 0
                begin 
                    if properties_hash[product.uuid.to_s][params[:size]][params[:color]]
                        if properties_hash[product.uuid.to_s].length > 1
                            if properties_hash[product.uuid.to_s][params[:size]].length > 1
                                properties_hash[product.uuid.to_s][params[:size]].delete(params[:color])
                            else
                                properties_hash[product.uuid.to_s].delete(params[:size])
                            end
                        else
                            properties_hash.delete(product.uuid.to_s)
                        end
                    end
                    order.properties = properties_hash
                rescue => e
                    render json:{status:400, success:false, message:"size color and product id need to exist in cart"}
                    return false
                end
            end

            order.total = order.sub_total + order.shipping + order.tax
            if order.save
                order = order.as_json
                order["total"] = number_to_currency(order["total"])
                order["sub_total"] = number_to_currency(order["sub_total"])
                order["shipping"] = number_to_currency(order["shipping"])
                order["tax"] = number_to_currency(order["tax"])
                order["properties"].each do |id,value|
                    order["properties"][id].each do |size, value|
                        order["properties"][id][size].each do |color,value|
                            order["properties"][id][size][color]["price"] = number_to_currency(order["properties"][id][size][color]["price"])
                            order["properties"][id][size][color]["tax"] = number_to_currency(order["properties"][id][size][color]["tax"])
                            order["properties"][id][size][color]["total"] = number_to_currency(order["properties"][id][size][color]["total"])
                            order["properties"][id][size][color]["shipping"] = number_to_currency(order["properties"][id][size][color]["shipping"])
                            order["properties"][id][size][color]["sub_total"] = number_to_currency(order["properties"][id][size][color]["sub_total"])
                        end
                    end
                end
                render json:{status:200, success:true, order:order}
            else
                render json:{status:500, success:false}
                Rails.logger.info(order.errors.inspect)
            end
        else
            render json:{status:404, success:false}
        end
    end
    def delete
    end
end
