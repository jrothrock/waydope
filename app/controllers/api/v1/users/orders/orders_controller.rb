include ActionView::Helpers::NumberHelper
class Api::V1::Users::Orders::OrdersController < ApplicationController
    include ActionView::Helpers::NumberHelper
	def read
        if request.headers["offset"] != nil && request.headers["offset"] != ''
            offset = request.headers["offset"] != '0' || request.headers["offset"] != 0 ? Integer(request.headers["offset"].to_s,10) : 0
        else 
            offset = 0
        end
        currentuser = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if currentuser && params["user"] === currentuser.username
            sanitized_query = Order.escape_sql(["SELECT count(*) OVER () AS count, o.* FROM orders o WHERE o.user_uuid = ? AND o.status = 2 GROUP BY o.id ORDER BY created_at DESC OFFSET ? LIMIT 5", currentuser.uuid,offset])
            orders = Order.find_by_sql(sanitized_query)
            if orders
                orders = orders.map(&:as_json) # has to be done due to total,sub_total,tax,and shipping columns being decimals. Will return zero with number_to_currency
                orders.each do |order|
                    puts order
                    products = order["properties"] && order["properties"] != {} ? Product.where('uuid IN (?)', order["properties"].keys).select_with(App.getGoodColumns('apparel',false,nil,true)).as_json(include: :photos).to_a : nil
                    order["products"] = [] # turn object into an array so we can add the products.
                        # we're looping again... Not very good. 
                    order["properties"].each do |id,ihash|
                        ihash.each do |size,shash|
                            shash.each do |color,chash|
                                chash["price"] = number_to_currency(chash["price"])
                                chash["tax"] = number_to_currency(chash["tax"])
                                chash["shipping"] = number_to_currency(chash["shipping"])
                                chash["total"] = number_to_currency(chash["total"])
                                chash["sub_total"] = number_to_currency(chash["sub_total"])
                            end
                        end
                    end
                    if products
                        products.each do |product|
                            product["price"] = number_to_currency(product["price"])
                            product["sale_price"] = number_to_currency(product["sale_price"])
                            product["shipping"] = number_to_currency(product["shipping"])
                            order["products"] << product
                            product["votes"] = nil
                            product["report_users"] = nil
                            product["likes"] = nil
                            product["ratings"] = nil
                            product["fit"] = nil
                        end
                    end
                    # if order.user_uuid && user.uuid != order.user_uuid
                    #     render json:{status:401, success:false}
                    #     return false
                    # end
                    # total = order.total
                    # order.total = number_to_currency(total)
                    order["total"] = number_to_currency(order["total"])
                    order["sub_total"] = number_to_currency(order["sub_total"])
                    order["shipping"] = number_to_currency(order["shipping"])
                    order["tax"] = number_to_currency(order["tax"])
                end
                count = orders && orders.first ? orders.first["count"] : 0
                page = offset > 0 ? ((offset / 5) + 1) : 1
                pages = (count / 5.0).ceil
                render json:{status:200, success:true, orders:orders,  offset:offset,count:count,page:page, pages:pages}
            else
                render json:{status:404, success:false}
            end
        else 
            render json:{status:401, success:false}
        end
    end
end
