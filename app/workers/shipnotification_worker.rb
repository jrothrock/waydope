class ShipnotificationWorker
    include Sidekiq::Worker
    def perform(sale,order,product,size,color,code)
        order = Order.find_by_id(order)

        
        notification = Notification.new

        shipped_hash = order.shipped
        if shipped_hash.key?(order.to_s)
            if shipped_hash[order.to_s].key?(product)
                if !shipped_hash[order.to_s][product][size]
                    shipped_hash[order.to_s][product][size] = {}
                end
            else
                shipped_hash[order.to_s][product] = {}
                shipped_hash[order.to_s][product][size] = {}
            end
        else
            shipped_hash[order.to_s] = {}
            shipped_hash[order.to_s][product] = {}
            shipped_hash[order.to_s][product][size] = {}
        end
        
        shipped_hash[order.to_s][product][size][color]=code
      
        user = User.where('uuid = ?', order.user_uuid).first
        notification.user_username = user.username
        notification.notified_by = 'system'
        notification.notice_type = 'new_shipment'
        notification.post_type = sale["type"]
        notification.category = sale["category"]
        notification.subcategory = sale["sub_category"]
        notification.url = sale["url"]
        notification.title = "#{sale['title']}, #{sale['size']}, #{sale['color']}"
        notification.quantity = sale["quantity"]
        notification.save

        order.new_shipping_notification = false
        order.shipped = shipped_hash
        order.save
        UserMailer.shipping_confirmation_email(user,order,sale).deliver
    end
end