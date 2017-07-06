class UserMailer < ApplicationMailer
    default from: "noreply@waydope.com"
    def verify_email(user)
        attachments.inline['logo.png'] =  File.read(Rails.root.join("public/images/waydope_logo_thumb.png"),:encoding => 'UTF-8')
        attachments.inline['facebook.png'] = File.read(Rails.root.join("public/images/facebook.png"),:encoding => 'UTF-8')
        attachments.inline['twitter.png'] = File.read(Rails.root.join("public/images/twitter.png"),:encoding => 'UTF-8')
        @user = user
        @production = Rails.env.production?
        mail(to: @user.email, subject: 'Verify Email')
    end
    def ssn_required(user)
        attachments.inline['logo.png'] =  File.read(Rails.root.join("public/images/waydope_logo_thumb.png"),:encoding => 'UTF-8')
        attachments.inline['facebook.png'] = File.read(Rails.root.join("public/images/facebook.png"),:encoding => 'UTF-8')
        attachments.inline['twitter.png'] = File.read(Rails.root.join("public/images/twitter.png"),:encoding => 'UTF-8')
        @user = user
        @production = Rails.env.production?
        mail(to: @user.email, subject: 'Aditional Seller Information Is Required')
    end
    def reset_email(user)
        attachments.inline['logo.png'] =  File.read(Rails.root.join("public/images/waydope_logo_thumb.png"), :encoding => 'UTF-8')
        attachments.inline['facebook.png'] = File.read(Rails.root.join("public/images/facebook.png"),:encoding => 'UTF-8')
        attachments.inline['twitter.png'] = File.read(Rails.root.join("public/images/twitter.png"),:encoding => 'UTF-8')
        @user = user
        @production = Rails.env.production?
        mail(to: @user.email, subject: 'Reset Password')
    end
    def shipping_confirmation_email(user,order,sale)
        attachments.inline['logo.png'] =  File.read(Rails.root.join("public/images/waydope_logo_thumb.png"),:encoding => 'UTF-8')
        attachments.inline['facebook.png'] = File.read(Rails.root.join("public/images/facebook.png"),:encoding => 'UTF-8')
        attachments.inline['twitter.png'] = File.read(Rails.root.join("public/images/twitter.png"),:encoding => 'UTF-8')
        @user = user
        @order = order
        @sale = sale
        download = open(@sale["picture"])
        file = Tempfile.new(['hello', '.png'])
        IO.copy_stream(download, file.path)
        attachments.inline['product.png'] = File.read(file.path)
        download.close
        mail(to: @user.email, subject: "Your Way Dope Order Has Been Shipped")
    end
    def order_buyer_email(user,order,products)
        sub_total_hash = order["sub_totals"]
        shipping_hash = order["shippings"]
        totals_hash = order["totals"]
        tax_hash = order["taxes"]
        products.each_with_index do |product,index|
            download = open(product["upload_urls"].first)
            file = Tempfile.new(['hello', '.png'])
            IO.copy_stream(download, file.path)
            puts 'before inline'
            attachments.inline["product_#{product['uuid']}.png"] = File.read(file.path)
            puts 'after inline'
            download.close
            product["total"] = number_to_currency(totals_hash[product["id"].to_s])
            product["sub_total"] = number_to_currency(sub_total_hash[product["id"].to_s])
            product["shipping"] = number_to_currency(shipping_hash[product["id"].to_s])
            product["tax"] = tax_hash[product["id"].to_s] ? number_to_currency(tax_hash[product["id"].to_s]) : "$0.00"
        end
        attachments.inline['logo.png'] =  File.read(Rails.root.join("public/images/waydope_logo_thumb.png"))
        attachments.inline['facebook.png'] = File.read(Rails.root.join("public/images/facebook.png"))
        attachments.inline['twitter.png'] = File.read(Rails.root.join("public/images/twitter.png"))
        @order = order
        @user = user
        @products = products
        mail(to: @user.email, subject: "Your Way Dope Order Has Been Confirmed")
    end
    def order_seller_email(user,order,product)
        attachments.inline['logo.png'] =  File.read(Rails.root.join("public/images/waydope_logo_thumb.png"))
        attachments.inline['facebook.png'] = File.read(Rails.root.join("public/images/facebook.png"))
        attachments.inline['twitter.png'] = File.read(Rails.root.join("public/images/twitter.png"))
        @order = order
        @product = product
        download = open(product["upload_urls"].first)
        file = Tempfile.new(['hello', '.png'])
        IO.copy_stream(download, file.path)
        attachments.inline["product.png"] = File.read(file.path)
        @user = user
        mail(to: @user.email, subject: "New Way Dope Sale")
    end
end
