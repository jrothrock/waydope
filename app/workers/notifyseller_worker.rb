require 'sendgrid-ruby'
class NotifysellerWorker
    include Sidekiq::Worker
    include ActionView::Helpers::NumberHelper
    def perform
        
        orders = Order.where('sellers_notified = false AND status = 2')
        orders.each do |order|
            ids = order.properties.keys
            products = Product.where('uuid IN (?)', ids)
            tax_hash =  order.taxes

            order.properties.each do |id,value|
                product = products.detect{|prod| prod.uuid === id}
                value.each do |size,value1|
                  value1.each do |color,value2|
                      seller = Seller.where('id = ?', product.seller_id).first
                      user = User.where('id = ?', seller.user_id).first
                      notification = Notification.new
                      notification.user_username = user.username
                      notification.notice_type = 'new_sale'
                      notification.post_type = product.post_type
                      notification.category = product.main_category
                      notification.subcategory = product.sub_category
                      notification.url = product.url
                      notification.title = product.title
                      notification.save
                      price = order.properties[id][size][color]["price"]
                      shipping = order.properties[id][size][color]["shipping"]
                      tax = order.properties[id][size][color]["tax"]
                      sub_total = order.properties[id][size][color]["sub_total"]
                      total = sub_total.to_f + shipping.to_f + tax.to_f
                      shipping_info = {
                            "firstname" => order.firstname,
                            "lastname" => order.lastname,
                            "address" => order.address,
                            "address_two" => order.address_two,
                            "city" => order.city,
                            "state" => order.state,
                            "zip" => order.zip
                        }
                        sales_hash = seller.sales
                        if sales_hash.key?(order.uuid.to_s)
                            if sales_hash[order.uuid.to_s].key?(id)
                                if !sales_hash[order.uuid.to_s][id].key?(size)
                                    sales_hash[order.uuid.to_s][id][size] = {}
                                end
                            else
                                sales_hash[order.uuid.to_s][id] = {}
                                sales_hash[order.uuid.to_s][id][size] = {}
                                sales_hash[order.uuid.to_s][id][size][color] = {}
                            end
                        else
                            sales_hash[order.uuid.to_s] = {}
                            sales_hash[order.uuid.to_s][id] = {}
                            sales_hash[order.uuid.to_s][id][size] = {}
                            sales_hash[order.uuid.to_s][id][size][color] = {}
                        end
                        sales_hash[order.uuid][id][size][color] = {    
                            "order_id" => order.uuid,
                            "time" => Time.now,
                            "title" => product.title,
                            "product_id" => product.uuid,
                            "color" => color,
                            "size" => size,
                            "shipping_type" => product.shipping_type,
                            "type" => product.post_type,
                            "category" => product.main_category,
                            "sub_category" => product.sub_category,
                            "url" => product.url,
                            "quantity" => order.properties[id][size][color]["quantity"],
                            "picture" => product.upload_urls[0],
                            "total" => number_to_currency(total),
                            "sub_total" => number_to_currency(sub_total),
                            "shipping" => number_to_currency(shipping),
                            "tax" => number_to_currency(tax),
                            "confirmation" => false,
                            "shipping_info" => shipping_info
                        }

                        seller.sales = sales_hash
                        UserMailer.order_seller_email(user,sales_hash[order.uuid][id][size][color],product).deliver
                        seller.new_sales << order.id
                        puts 'end'
                        puts total.to_f
                        puts sub_total.to_f
                        puts shipping.to_f
                        puts tax.to_f
                        seller.total += 1
                        seller.total_sales += total.to_f
                        if seller.total_sales > 1000 && !user.ssn_uploaded
                            user.ssn_required = true
                            user.save
                            Product.where("user_id = ?", user.id).in_batches.update_all({approved:false})
                            NotificationssnWorker.perform_in(1.minute,user.uuid)
                        end
                        seller.total_sub += sub_total.to_f
                        seller.total_shipping += shipping.to_f
                        seller.total_tax += tax.to_f
                        seller.save
                    end
                end
            end

            order.sellers_notified = true
            order.save
        end
    end
end
