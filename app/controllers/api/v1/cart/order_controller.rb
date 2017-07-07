require 'paypal-sdk-rest'
require "stripe"
class Api::V1::Cart::OrderController < ApplicationController
    include PayPal::SDK::REST
    include PayPal::SDK::Core::Logging

    # yes paypal, let's create an object named Order, cause that won't cause any conflicts
    def update
        auth =  request.headers["Authorization"] ? request.headers["Authorization"] : params[:Authorization]
        user = auth ? User.find_by_token(auth.split(' ').last) : nil
        order = params[:cart] ? ApplicationRecord::Order.where('uuid = ?', params[:cart]).first : nil
        if order && order != []
        
            if order.user_uuid && !user || user && user.uuid != order.user_uuid
                render json:{}, status: :unauthorized
                return false
            end

            if params[:paypal] != false && params[:paypal] != true && params[:paypal] != "false" && params[:paypal] != "true"
                render json:{paypal:true, message:"paypal parameter is required, must be either true or false - can be a string, or boolean"}, status: :bad_request
                return false
            end

            # if !order.zip_checked
            #     render json:{status:412, success:false, message:"order must have had zip checked prior to completion of an order. Please call /api/v1/cart/update passing in the order params, authoirzation header, update_zip param set to true, and your zip param. "}
            #     return false
            # end

            
            products = Product.where('uuid IN (?)', order.properties.keys)

            sold_out_products = {}
            products_saved = []
            payouts = []
            products_old_quantities = {}
            purchased_already = {}
            clear_cache_ids = {}




            order.properties.each do |id,value|
                if !products_old_quantities.key?(id)
                    products_old_quantities[id] ={}
                end

                product = products.detect{|product| product.uuid === id}
                purchased = 0

                value.each do |size,value1|
                    if !products_old_quantities[id].key?(size)
                        products_old_quantities[id][size] ={}
                    end
                    value1.each do |color,value|
                        products_old_quantities[id][size][color] = product.properties[size][color]["quantity"].to_i
                        puts order.properties[id][size][color]["quantity"].to_i
                        value = product.properties[size][color]["quantity"].to_i - order.properties[id][size][color]["quantity"].to_i
                        payouts << (!product.waydope)
                        if value < 0
                            if sold_out_products.key?(product.uuid)
                                if sold_out_products[product.uuid].key?(size)
                                    sold_out_products[product.uuid][size][color] = true
                                else
                                    sold_out_products[product.uuid][size] = {}
                                    sold_out_products[product.uuid][size][color] = true
                                end
                            else
                                sold_out_products[product.uuid] = {}
                                sold_out_products[product.uuid][size] = {}
                                sold_out_products[product.uuid][size][color] = true
                            end
                        else
                            purchased += order.properties[id][size][color]["quantity"].to_i
                            product.properties[size][color]["quantity"] = value
                        end

                    end
                end
                purchases_hash = product.purchasers
                if !user
                    product.guest_purchases += 1
                    user =  'guest_' + product.guest_purchases.to_s
                    guest_user = true
                end
                if !guest_user && (user && user.uuid && purchases_hash.key?(user.uuid))
                    if !purchased_already.key?(product.uuid) 
                        purchased_already[product.uuid] = {}
                    end
                    purchased_already[product.uuid][user.uuid ] = purchases_hash[user.uuid]
                end  
                user_type = guest_user ? user : user.uuid
                if purchases_hash.key?(user_type)
                    purchases_hash[user_type] += purchased.to_i
                else
                    purchases_hash[user_type] = purchased
                end
                product.purchasers = purchases_hash
                product.sold_out = Product.checkSoldOut(product.properties)
                if product.sold_out
                    clear_cache_ids[product.uuid] = product.post_type
                end
            end

            # products.each do |product|
            #     products_old_quantities[product.uuid] = product.quantity
            #     product.quantity -= quantity_hash[product.uuid.to_s].to_i
            #     if product.quantity < 0
            #         sold_out_products[product.uuid] = (product.quantity + quantity_hash[product.uuid.to_s].to_i)
            #         product.quantity = products_old_quantities[product.uuid]
            #         #update order to remove the product, or return order so user can see that it has changed.
            #         #probably the latter
            #     else
            #         purchases_hash = product.purchasers
            #         if !user
            #             product.guest_purchases += 1
            #             user =  'guest_' + product.guest_purchases.to_s
            #             guest_user = true
            #         end
            #         if  guest_user || (user && user.uuid && purchases_hash.key?(user.uuid))
            #             purchased_already[product.uuid] = guest_user ? user : user.uuid 
            #         end    
            #         user_type = guest_user ? user : user.uuid
            #         purchases_hash[user_type] = quantity_hash[product.uuid]
            #         product.purchasers = purchases_hash
            #         if product.quantity === 0 
            #                 product.sold_out = true 
            #                 clear_cache_ids[product.uuid] = product.post_type
            #         end
            #     end
            # end
            puts 'sold out products'
            puts sold_out_products
            puts sold_out_products.length
            puts 'payouts'
            puts payouts
            #apparently, an !empty_hash.length === false AND !empty_hash.keys.length === false
                #weird.
            if sold_out_products.keys.length === 0
                products.each do |product|
                    begin
                        if product.save
                            products_saved << product.uuid
                        end
                        rescue ActiveRecord::StaleObjectError
                            product.reload
                            sold_out = false
                            product.properties.each do |size,value|
                                value.each do |color,value1|
                                    products_old_quantities[product.uuid][size][color] = product.properties[size][color]["quantity"]
                                    if ( order[product.uuid].key?(size) && order[product.uuid][size].key?(color) && (product[size][color]["quantity"].to_i  - order.properties[id][size][color]["quantity"].to_i < 0))
                                        if sold_out_products.key?(product.uuid)
                                            if sold_out_products[product.uuid].key?(size)
                                                sold_out_products[product.uuid][size][color] = true
                                            else
                                                sold_out_products[product.uuid][size] = {}
                                                sold_out_products[product.uuid][size][color] = true
                                            end
                                        else
                                            sold_out_products[product.uuid] = {}
                                            sold_out_products[product.uuid][size] = {}
                                            sold_out_products[product.uuid][size][color] = true
                                        end
                                    end
                                end
                            end
                            product.sold_out = Product.checkSoldOut(product.properties)
                            if !sold_out
                                retry
                            end
                        rescue => e
                            puts e
                    end
                end
            end
            if sold_out_products.keys.length != 0 
                products_hash = order.quantities

                sold_out_products.each{|product| products_hash.delete(product.to_s)}
                order.quantities = products_hash
                order.save
                Product.rollProductsBack(user,products,products_old_quantities,purchased_already)
                render json:{message:'state has changed, resubmit.', sold_out:sold_out_products, order:order}, status: :conflic
                return false
            end

            order.firstname = params[:firstname]
            order.lastname = params[:lastname]
            order.address = params[:address]
            order.address_two = params[:address_two]
            order.city = params[:city]
            order.state = params[:state]
            order.zip = params[:zip]
            order.status = 2
            order.email = params[:email] ? params[:email] : order.email
            order.purchased_at = Time.now
            order.paid_with = params[:paypal] === true ? 'paypal' : 'stripe'
            ApplicationRecord::Order.transaction do
                begin
                    if order.save
                        if params[:paypal] === true || params[:paypal] === "true"
                            if !params[:paymentID] || !params[:payerID]
                                render json:{}, status: :internal_server_error
                                return false
                            end
                            begin
                                mode = Rails.env.production? ? 'live' : 'sandbox'
                                PayPal::SDK::REST.set_config(
                                    :mode => mode, # "sandbox" or "live"
                                    :client_id => Rails.application.secrets.paypal_id,
                                    :client_secret => Rails.application.secrets.paypal_secret
                                )
                                payment = Payment.find(params[:paymentID])
                                if payment.execute( :payer_id => params[:payerID] )  # return true or false
                                    puts "Payment[#{payment.id}] executed successfully"
                                else
                                    raise "payment execution failed"
                                end
                                
                                if payouts.include?(true)
                                    paypal_items= []
                                    index = -1
                                    puts 'payouts include true'
                                    order.properties.each do |id,val|
                                        product = products.detect{|product| product.uuid === id}
                                        val.each do |size,val2|
                                            val2.each do |color,val3|
                                                index += 1
                                                if payouts[index]
                                                    item = {
                                                        :recipient_type => 'EMAIL',
                                                        :amount => {
                                                            :value => ((val3["sub_total"].to_f + val3["shipping"].to_f) * 0.88),
                                                            :currency => "USD"
                                                        },
                                                        :note => "Order: #{order.uuid} - Product: #{product.title}, #{size}, #{color}",
                                                        :receiver => product.email,
                                                        :sender_item_id => "#{order.uuid}_#{index}"
                                                    }
                                                    paypal_items << item
                                                end
                                            end
                                        end
                                    end
                                    puts '=======items======'
                                    puts '=======items======'
                                    puts '=======items======'
                                    puts '=======items======'
                                    puts paypal_items

                                    if paypal_items.length
                                        @payout = Payout.new({
                                            :sender_batch_header => {
                                            :sender_batch_id => order.uuid,
                                            :email_subject => 'New Sale On Product',
                                            },
                                            :items => paypal_items
                                        })
                                        puts @payout.as_json

                                        begin
                                            @payout_batch = @payout.create
                                            logger.info "Created Payout with [#{@payout_batch.batch_header.payout_batch_id}]"
                                            order.paypal_payouts_id = @payout_batch.batch_header.payout_batch_id
                                            order.paypal_payment_id = payment.id
                                            order.save
                                        rescue ResourceNotFound => err
                                            logger.error @payout.error.inspect
                                            ExceptionNotifier.notify_exception(e,
                                                :env => request.env, :data => {:message => "Paypal Order Batch Failed: #{e.inspect}, #{e.backtrace}"})
                                        end
                                    end
                                end
                            rescue Exception => e
                                    Rails.logger.info(e.inspect)
                                    Rails.logger.info(e.backtrace)
                                    Rails.logger.info(payment.error.inspect)
                                    ExceptionNotifier.notify_exception(e,
                                                :env => request.env, :data => {:message => "Paypal Order Payment Has Failed. Error: #{e.inspect}, #{e.backtrace}, Payment:#{payment.error.inspect}"})
                                    render json:{paylpal_fail:true, message:'paypal error', error:payment.error}, status: :internal_server_error
                                    Product.rollProductsBack(user,products,products_old_quantities,purchased_already)
                                    raise ActiveRecord::Rollback
                            end
                        else
                            Stripe.api_key =  Rails.application.secrets.stripe
                            puts Stripe.api_key
                            puts Stripe::Charge.as_json
                            # Get the credit card details submitted by the form
                            token = params[:token]
                            amount = (order.total * 100).to_i

                            # Create a charge: this will charge the user's card
                            begin
                                charge = Stripe::Charge.create(
                                    :amount => amount, # Amount in cents
                                    :currency => "usd",
                                    :source => token,
                                    :description => `Charge for order #{order.uuid}`,
                                    :transfer_group => "ORDER_#{order.uuid}",
                                )
                                transfers = {}
                                if payouts.include?(true)
                                    index = -1
                                    order.properties.each do |id,val|
                                        product = products.detect{|product| product.uuid === id}
                                        val.each do |size,val2|
                                            val2.each do |color,val3|
                                                index += 1
                                                if payouts[index]
                                                    transfer = Stripe::Transfer.create({
                                                        :amount => (((val3["sub_total"].to_f + val3["shipping"].to_f) * 100) * 0.88).to_i,
                                                        :currency => "usd",
                                                        :destination => product.stripe_id,
                                                        :transfer_group => "ORDER_#{order.uuid}",
                                                    })
                                                    transfers[product.stripe_id] = transfer.id
                                                end
                                            end
                                        end
                                    end
                                end

                                

                                rescue Stripe::CardError => e
                                    Rails.logger.info(e)
                                    render json:{card_fail:true, message:'card error'}, status: :internal_server_error
                                    Product.rollProductsBack(user,products,products_old_quantities,purchased_already)
                                    raise ActiveRecord::Rollback
                                    return false
                                rescue => e
                                    Rails.logger.info(e)
                                    ExceptionNotifier.notify_exception(e,
                                                :env => request.env, :data => {:message => "Paypal Stripe Payment Has Failed. Error: #{e.inspect}, #{e.backtrace}"})
                                    render json:{message:"failed in the stripe payment"}, status: :internal_server_error
                                    Product.rollProductsBack(user,products,products_old_quantities,purchased_already)
                                    raise ActiveRecord::Rollback
                                    return false
                            end
                            order.stripe_payment_id = charge.id
                            order.stripe_payout_ids = transfers
                        end  
                        render json:{order:order.as_json.except("paid_with","stripe_payment_id", "stripe_payout_ids", "paypal_payment_id", "paypal_payouts_id", "tracker_sent", "tracker_updated")}, status: :ok
                        NotifysellerWorker.perform_in(15.seconds)
                        if user.is_a? String
                            user = OpenStruct.new({username: order.firstname, email:order.email})
                        end
                        ApplicationRecord::Order.sendEmails(order,user)
                        puts clear_cache_ids
                        if clear_cache_ids.length
                            clear_cache_ids.keys.each do |key|
                                PurgecacheWorker.perform_async(clear_cache_ids[key],key,clear_cache_ids[key])
                            end
                        end
                    else
                        render json:{}, status: :internal_server_error
                        Product.rollProductsBack(user,products,products_old_quantities,purchased_already)
                        Rails.logger.info(order.errors.inspect)
                    end
                rescue => e
                    # render json:{}, status: :internal_server_error
                    puts e
                    ExceptionNotifier.notify_exception(e,
                        :env => request.env, :data => {:message => "Order Has Failed. Error: #{e.inspect}, #{e.backtrace}"})
                    if Rails.env.production?
                        # render json:{error:e}, status: :internal_server_error
                    else
                        # render json:{error:e, backtrace: e.backtrace}, status: :internal_server_error
                    end
                    Product.rollProductsBack(user,products,products_old_quantities,purchased_already)
                end
            end
        else
            render json:{}, status: :not_found
        end
    end
end