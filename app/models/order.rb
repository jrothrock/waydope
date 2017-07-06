class Order < ApplicationRecord
  def self.setUUID
    begin 
      uuid = SecureRandom.hex(5)
      uuid[0] = '' # bring string down to 9 characters
      if(Order.unscoped.where("uuid = ?", uuid).any?) then raise 'Go buy some lotto tickets, order UUID has a duplicate!' end
      return uuid
      rescue
        retry
    end
  end

  def self.sendEmails(order,user)
    order = order.as_json
     products = Product.where("uuid in (?)",order["properties"].keys).as_json
     order["properties"].each do |id, value|
        value.each do |size,value1|
          value1.each do |color,value2|
            order["properties"][id][size][color]["price"] = number_to_currency(order["properties"][id][size][color]["price"])
            order["properties"][id][size][color]["shipping"] = number_to_currency(order["properties"][id][size][color]["shipping"])
            order["properties"][id][size][color]["tax"] = number_to_currency(order["properties"][id][size][color]["tax"])
            order["properties"][id][size][color]["total"] = number_to_currency(order["properties"][id][size][color]["total"])
            order["properties"][id][size][color]["sub_total"] = number_to_currency(order["properties"][id][size][color]["sub_total"])
          end
        end
     end
     puts order
     order["total"] = number_to_currency(order["total"])
     order["sub_total"] = number_to_currency(order["sub_total"])
     order["shipping"] = number_to_currency(order["shipping"])
     order["tax"] = number_to_currency(order["tax"])
     puts 'right before email sent'
     UserMailer.order_buyer_email(user,order,products).deliver
  end
end
