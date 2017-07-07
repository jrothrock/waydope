include ActionView::Helpers::NumberHelper
class Api::V1::Users::Orders::OrderController < ApplicationController
    include ActionView::Helpers::NumberHelper
	def read
        currentuser = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if params["user"] === currentuser.username
            order = Order.where("uuid = ?", params["order"]).first
            if order
                order = order.as_json
                products = order["properties"] ? Product.where('uuid IN (?)', order["properties"].keys).select_with(App.getGoodColumns('apparel',false,nil,true)).as_json(include: :photos).to_a : nil
                products.each do |product|
                    product["price"] = number_to_currency(product["price"])
                    product["sale_price"] = number_to_currency(product["sale_price"])
                    product["shipping"] = number_to_currency(product["shipping"])
                    product["properties"].each do |id,val|
                        val.each do |color,value|
                            if(color != 'width' && color != 'depth' && color != 'height')
                                value["price"] = number_to_currency(value["price"])
                            end
                        end
                    end
                    product["votes"] = nil
                    product["report_users"] = nil
                    product["ratings"] = nil
                    product["likes"] = nil
                    order["products"] << product
                end
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
                order["total"] = number_to_currency(order["total"])
                order["sub_total"] = number_to_currency(order["sub_total"])
                order["shipping"] = number_to_currency(order["shipping"])
                order["tax"] = number_to_currency(order["tax"])
                render json:{status:200, success:true, order:order}
            else
                render json:{status:404, success:false}
            end
        else 
            render json:{status:401, success:false}
        end
    end
end
