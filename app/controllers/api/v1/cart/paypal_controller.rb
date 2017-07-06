require 'paypal-sdk-rest'
class Api::V1::Cart::PaypalController < ApplicationController
    include PayPal::SDK::REST
    include PayPal::SDK::Core::Logging
    def create

        puts params[:cart]
        # yes paypal, let's create an object named Order, cause that won't cause any conflicts
        order = params[:cart] ? ApplicationRecord::Order.where('uuid = ?', params[:cart]).first : nil
        puts order.as_json
        properties_hash = order["properties"]
        tax_hash = order.taxes
        products = Product.where("uuid IN (?)", properties_hash.keys)
        # ###Payment
        # A Payment Resource; create one using
        # the above types and intent as 'sale'

        items = []
        properties_hash.each do |id,value|
            product = products.detect{|product| product.uuid === id}
            value.each do |size, value1|
                value1.each do |color, value2|
                    product_hash = {}
                    product_hash["name"] = "#{product.title}#{size != 'defualt' ? ', ' + size : ''}#{color != 'defualt' ? ', ' + color : ''}"
                    product_hash["description"] = product.description.length > 50 ? product.description[0..50].split()[0..-2].join(' ') + "..." : product.description
                    product_hash["price"] = product.properties[size][color]["price"].to_f
                    product_hash["currency"] = "USD"
                    product_hash["tax"] = tax_hash[id][size][color] == 0.0 ? "0.00" : tax_hash[id][size][color].to_s
                    product_hash["quantity"] = properties_hash[product.uuid.to_s][size][color]["quantity"].to_i
                    items << product_hash
                end
            end
        end

        # products.each_with_index do |product|

        #     product_hash = {}
        #     product_hash["name"] = product.title
        #     product_hash["description"] = product.description.length > 50 ? product.description[0..50].split()[0..-2].join(' ') + "..." : product.description
        #     product_hash["price"] = product.sale_price ? product.sale_price : product.price
        #     product_hash["currency"] = "USD"
        #     product_hash["tax"] = tax_hash[product.uuid.to_s] == 0.0 ? "0.00" : tax_hash[product.uuid.to_s].to_s
        #     product_hash["quantity"] = properties_hash[product.uuid.to_s].to_i
        #     items << product_hash
        # end
        mode = Rails.env.production? ? 'live' : 'sandbox'
        PayPal::SDK::REST.set_config(
            :mode => mode, # "sandbox" or "live"
            :client_id => Rails.application.secrets.paypal_id,
            :client_secret => Rails.application.secrets.paypal_secret
        )


        @payment = Payment.new({
            :intent =>  "sale",

            # ###Payer
            # A resource representing a Payer that funds a payment
            # Payment Method as 'paypal'
            :payer =>  {
                :payment_method =>  "paypal" },

            # ###Redirect URLs
            :redirect_urls => {
                :return_url => "https://waydope.com/cart#shipping",
                :cancel_url => "https://waydope.com" },

            # ###Transaction
            # A transaction defines the contract of a
            # payment - what is the payment for and who
            # is fulfilling it.
            :transactions =>  [{

                # Item List
                :item_list => {
                    :items => items
                },

                # ###Amount
                # Let's you specify a payment amount.
                :amount =>  {
                    :total =>  order.total.to_s,
                    :currency =>  "USD",
                    :details =>
                        {
                            :subtotal => order.sub_total.to_s,
                            :shipping => order.shipping.to_s,
                            :tax => order.tax.to_s,
                        } 
                },

                :description =>  "Your Way Dope order." 
                
            }]
        })

        # Create Payment and return status
        if @payment.create
        # Redirect the user to given approval url
            render json:{status:200, success:true, paymentID:@payment.id}
            # @redirect_url = @payment.links.find{|v| v.rel == "approval_url" }.href
            # logger.info "Payment[#{@payment.id}]"
            # logger.info "Redirect: #{@redirect_url}"
        else
            logger.error @payment.error.inspect
            render json:{status:500, success:false}
        end
    end
end
