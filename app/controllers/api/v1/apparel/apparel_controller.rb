require 'geokit'
class Api::V1::Apparel::ApparelController < ApplicationController
    include ActionView::Helpers::DateHelper
    include ActionView::Helpers::NumberHelper
	def index
    end
    def read
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user && user.admin
            apparel = ::Product.where("post_type = 'apparel' AND url = ? AND main_category = ? AND sub_category = ? AND flagged = false AND removed = false", request.headers["id"], request.headers["maincategory"], request.headers["subcategory"]).first.as_json(include: :photos)
        else
            apparel = ::Product.where("post_type = 'apparel' AND url = ? AND main_category = ? AND sub_category = ? AND flagged = false AND removed = false", request.headers["id"], request.headers["maincategory"], request.headers["subcategory"]).select_with(App.getGoodColumns('apparel',false,nil,true)).first.as_json(include: :photos)
        end
		if apparel
            if !apparel["removed"]
                if user
                    apparel["user_liked"] = apparel["likes"].key?(user.uuid) ? true : false
                    apparel["user_voted"] = apparel["votes"].key?(user.uuid) ? apparel["votes"][user.uuid] : nil
                    apparel["user_rated"] = apparel["ratings"].key?(user.uuid) ? true : false
                end
                apparel["properties"].each do |key, val|
                    val.each do |key1,val1|
                        if(key1 != 'width' && key1 != 'depth' && key1 != 'height')
                            val1["price"] =  number_to_currency(val1["price"])
                        end
                    end
                end
                apparel["price"] = apparel["price"] ? number_to_currency(apparel["price"]) : nil
                # apparel["sale_price"] = apparel["sale_price"] ? number_to_currency(apparel["sale_price"]) : nil
                apparel["shipping"] = apparel["shipping"] ? number_to_currency(apparel["shipping"]) : nil
                apparel["time_ago"] = apparel["time_ago"] ? time_ago_in_words(apparel["created_at"]) + ' ago' : nil
                apparel["ratings"] = nil
                apparel["votes"] = nil
                apparel["likes"] = nil
                apparel["report_users"] = nil
                render json: {status:200, success:true, post:apparel.as_json.except("id")}
                user_id = user ? user.id : nil
                ViewcountWorker.perform_async(apparel["uuid"],user_id,'apparel',request.remote_ip)
            else
                render json:{status:410, success:false}
            end
		else
			render json: {status:404, success:false}
		end
	end
    def create
        # if (params[:post_type].to_i == 1 && (params[:file] && params[:file].content_type && !::Apparel.sanitizeUpload(params[:file].content_type)))
		# 	render json:{status:415, success:false, message:'unsupported media type'}
		# 	return false
		# end
		if request.headers["Authorization"]
			auth = request.headers["Authorization"]
		elsif params[:authorization]
			auth = params[:authorization]
		else
			render json: {status:401, success:false}
			return false
		end
		user = User.find_by_token(auth.split(' ').last)
		if user
            time = Time.now.strftime('%H%M%ST%m%d%Y')
            apparel = ::Product.new # idk why it needs the the two collons.
            apparel.title = params[:title] ? params[:title] : "temp-#{time}"
            apparel.creator = params[:creator] ? params[:creator] : "temp-#{time}"
            apparel.zip = params[:zip] ? params[:zip] : "temp-#{time}"
            # if (params[:file] && params[:post_type].to_i == 1)
			# 	puts 'here2'
			# 	apparel.photos = params[:file]
			# 	apparel.form = 1
			# elsif params[:post_type].to_i == 0
			# 	puts 'here3'
			# 	apparel.form = 0
			# else 
			# 	puts 'here1'
			# 	render json: {status:400,success:false, message:'need post_type parameter'}
			# 	return false
			# end
            apparel.user_id = user.id
            apparel.post_type = 'apparel'
            apparel.waydope = user.admin
            apparel.condition = params[:condition] ? params[:condition] : "temp-#{time}"
            apparel.main_category = params[:main_category] ? params[:main_category] : "temp-storage-category"
            apparel.sub_category = params[:sub_category] ? params[:sub_category] : "temp storage category"
            apparel.has_variations = params[:has_variations] ? params[:has_variations] : "temp-#{time}"
            apparel.description = params[:description] ? params[:description] : ""
            apparel.stripped = params[:marked] ? ActionView::Base.full_sanitizer.sanitize(params[:marked]) : "" ## remove all html tags
			apparel.marked = params[:marked] ? ActionController::Base.helpers.sanitize(params[:marked]) : "" ## remove scripts and on* javascript
            apparel.has_site = params[:has_site] ? params[:has_site] : false
            apparel.creator_link = params[:link] ? params[:link] : ""
            apparel.color = params[:color] ? params[:color] : "temp-#{time}"
            apparel.size = params[:size] ? params[:size] : "temp-#{time}"
            apparel.height = params[:height] ? params[:height] : 0
            apparel.width = params[:width] ? params[:width] : 0
            apparel.depth = params[:depth] ? params[:depth] : 0
            apparel.quantity = params[:quantity] ? params[:quantity] : 0
            apparel.condition = params[:condition] ? params[:condition] : 'nwb'
            apparel.turnaround_time = params[:turnaround_time] ? params[:turnaround_time] : 0
            apparel.returns = params[:returns] ? params[:return] : false
            apparel.properties = params[:properties] ? params[:properties] : {}
            apparel.shipping = params[:shipping] ? '%.2f' % params[:shipping].to_f : nil
            apparel.shipping_type = params[:shipping_type] ? params[:shipping_type] : "temp-#{time}"
            apparel.price = params[:price] ? '%.2f' % params[:price].to_f : nil
            apparel.email = user.email
            apparel.stripe_id = user.stripe_id
            apparel.sale_price = params[:sale_price] ? '%.2f' % params[:sale_price].to_f : nil
            apparel.uuid = Product.setUUID
            apparel.average_vote = 1
			apparel.votes = {user.uuid => 1}
            apparel.human_votes = {user.uuid => 1}
            apparel.likes = {user.uuid => 1}
            apparel.human_likes = {user.uuid => 1}
            apparel.flagged = false
            apparel.removed = false
			apparel.upvotes = 1
			apparel.votes_count = 1
            apparel.likes_count = 1
			apparel.og_url_name = params[:title] ? params[:title].parameterize.gsub('_','-') : "temp-#{time}"
            if params[:title]
                apparel.url = Product.findUrl(apparel,'apparel')
            else
                apparel.url = apparel.og_url_name
            end
            apparel.sold_out = true
            if apparel.properties
                prices = []
                begin
                    apparel.properties.each do |size,val|
                        val.each do |color,value|
                            if(color !='height' && color != 'width' && color !='depth')
                                if apparel.sold_out && value["quantity"].to_i > 0
                                    apparel.sold_out = false
                                end
                                prices << value["price"]
                            end
                        end
                    end
                rescue => e
                    render json:{status:400, success:false, message:'You know what you did. Please only pass in a properties value that looks like such -> {"size"=>{*height:optional, *width:optional, *size:optional, "color"=>{price:price, quantity:quantity}}}.'}
                    return false
                end
            else 
                prices = [0.00]
            end
            puts prices
            apparel.max_price = prices.length && prices.max != nil ? '%.2f' % prices.max : "0.00"
            apparel.min_price = prices.length && prices.min != nil ? '%.2f' % prices.min : "0.00"
            # don't know why i need to zero. ruby being dumb. remove it and watch some bullshit
            apparel.price = prices.length != 0 ?  '%.2f' % (prices.sum / prices.length) : 0
            apparel.submitted_by = user.username
            if apparel.save
				render json: {status:200, success:true, id:apparel.uuid, stage:(user.admin ? 3 : user.info_stage), url:apparel.url}
				user_hash = user.apparel
                user_hash[apparel.uuid] = true
                user.apparel = user_hash
				user.average_vote = ((user.average_vote * user.votes_count) + 1)/(user.votes_count + 1)
                if user.apparel_votes
                    votes_hash = user.apparel_votes
                    votes_hash[apparel.uuid] = 1
                    user.apparel_votes = votes_hash
                else
                    user.apparel_votes = {apparel.uuid => 1}
                end
				user.votes_count += 1
				user.save!
			else
				render json: {status:500, success:false}
				Rails.logger.info(post.errors.inspect) 
			end

        else 
            render json:{status:401, success:false}
        end
    end
    def update
        if request.headers["Authorization"]
			auth = request.headers["Authorization"]
		elsif params[:authorization]
			auth = params[:authorization]
		else
			render json: {status:401, success:false}
			return false
		end
		user = User.find_by_token(auth.split(' ').last)
		if user 
            apparel = ::Product.where("uuid = ?", params[:id]).first
            if apparel
                if !params[:properties] || !params[:properties].as_json.is_a?(Hash) || params[:properties].as_json.each.map{|key,value| value.is_a?(Hash)}.include?(false) || params[:properties].as_json.each.map{|key,value|value.each.map{|key_inner,value_inner| if(value_inner.is_a?(Hash)) then value_inner.keys.map(&:to_s) end}}.flatten.compact.sort.uniq != ["price", "quantity"]
                    render json:{status:400, success:false, message:'Pinche. The properties param is required, and must be an object/hash, with the style being = {"size"=>{*height:optional, *width:optional, *size:optional, "color"=>{price:price, quantity:quantity}}}.'}
                    return false
                end
                apparel.og_url_name = params[:title] ? params[:title].parameterize.gsub('_','-') : apparel.og_url_name
                apparel.main_category = params[:main_category] ? params[:main_category] : apparel.main_category 
                apparel.sub_category = params[:sub_category] ? params[:sub_category] : apparel.sub_category
                apparel.creator = params[:creator] ? params[:creator] : apparel.creator
                apparel.url = Product.findUrl(apparel,'apparel',params[:title],params[:creator])
                apparel.title = params[:title] ? params[:title] : apparel.title
                apparel.zip = params[:zip] ? params[:zip] : apparel.zip
                geo = params[:zip] ? Geokit::Geocoders::MultiGeocoder.geocode(request.remote_ip) : nil
                if geo && geo.success
                    apparel.state = geo.state 
                    apparel.city = geo.city 
                end
                #apparel.tax = 
                apparel.condition = params[:condition] ? params[:condition] : apparel.condition
                apparel.has_variations = params[:has_variations] ? params[:has_variations] : apparel.has_variations
                apparel.description = params[:description] ? params[:description] : apparel.description
				apparel.stripped = params[:marked] ? ActionView::Base.full_sanitizer.sanitize(params[:marked]) : apparel.stripped ## remove all html tags
				apparel.marked = params[:marked] ? ActionController::Base.helpers.sanitize(params[:marked]) : apparel.marked	## remove scripts and on* javascript
                apparel.has_site = params[:has_site] ? params[:has_site] : apparel.has_site
                apparel.creator_link = params[:link] ? params[:link] : ''
                apparel.form = params[:form] ? params[:form] : apparel.form
                apparel.condition = params[:condition] ? params[:condition] : apparel.condition
                apparel.color = params[:color] ? params[:color] : apparel.color
                apparel.size = params[:size] ? params[:size] : apparel.size
                apparel.height = params[:height] ? params[:height] : apparel.height
                apparel.width = params[:width] ? params[:width] : apparel.width
                apparel.depth = params[:depth] ? params[:depth] : apparel.depth
                apparel.quantity = params[:quantity] ? params[:quantity] : apparel.quantity
                apparel.turnaround_time = params[:turnaround_time] ? params[:turnaround_time] : apparel.turnaround_time
                apparel.returns = params[:returns] ? params[:returns] : apparel.returns
                apparel.email = user.email
                apparel.stripe_id = user.stripe_id
                apparel.old_properties = apparel.properties
                apparel.properties = params[:properties] ? params[:properties] : apparel.properties
                apparel.shipping = params[:shipping] ? '%.2f' % params[:shipping].to_f : apparel.shipping
                apparel.shipping_type = params[:shipping_type] ? params[:shipping_type] : apparel.shipping_type
                # apparel.price = params[:price] ? '%.2f' % params[:price].to_f : apparel.price
                apparel.sale_price = params[:sale_price] ? '%.2f' % params[:sale_price].to_f : nil
                apparel.approved = user.approved_seller ? true : false
                apparel.updated = true
                apparel.sold_out = true
                prices = []
                begin
                    params[:properties].each do |size,val|
                        val.each do |color,value|
                            if(color !='height' && color != 'width' && color !='depth')
                                if apparel.sold_out && value["quantity"].to_i > 0
                                    apparel.sold_out = false
                                end
                                prices << value["price"].to_f
                            end
                        end
                    end
                rescue => e
                    render json:{status:400, success:false, message:'You know what you did. Please only pass in a properties value that looks like such -> {"size"=>{*height:optional, *width:optional, *size:optional, "color"=>{price:price, quantity:quantity}}}.'}
                    return false
                end
                apparel.max_price = prices.length ? '%.2f' % prices.max : 0.00
                apparel.min_price = prices.length ? '%.2f' % prices.min : 0.00
                apparel.price = '%.2f' % (prices.sum / prices.length)
                seller = Seller.where('user_id = ?', user.id).first_or_create(:user_id => user.id)
                apparel.seller_id = seller.id
                new_sort = params[:sorted_ids]
                ids = apparel.photos.map {|p| p.uuid }
                if params[:sorted] && new_sort.sort == ids.sort
                    apparel.sorted = true
                    apparel.sorting = new_sort
                    if apparel.upload_urls
                        lookup = {}
                        apparel.sorting.each_with_index {|item,index| lookup[item] = index}
                        apparel.upload_urls = apparel.upload_urls.sort_by { |url| lookup.fetch(url.split('photo')[2].split('/')[4])} # split that mufucka up.
                    end
                end
                puts apparel.uploaded 
                puts ids.length >= new_sort.length
                if apparel.uploaded && ids.length >= new_sort.length
                    new_photo = true    
                end
                begin 
                    apparel.save!
                    render json: {status:200, success:true, url:apparel.url}
                    sleep 2
                    if !apparel.uploaded then ProductuploadWorker.perform_async end
                    if new_photo then ProductphotouploadWorker.perform_async(apparel.id) end
                    PurgecacheWorker.perform_async(apparel.post_type,apparel.id)
                rescue ActiveRecord::StaleObjectError
                    render json:{status:422, success:false, message:'Stale Object error, this product has most likely been updated recently.'} 
                rescue ActiveRecord::RecordInvalid => exception
                    render json: {status:500, success:false}
                    Rails.logger.info(apparel.errors.inspect)
                end
            else
                render json:{status:404, success:false}
            end
        else
            render json:{status:401, success:false}
        end
    end
    def delete
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
		if user 
			apparel = ::Product.where("uuid = ?", params[:id]).first
            if apparel
                apparel.destroy
                # may want to change this to just hide, keep the data, like everything else.
            else
                render json: {status:404, success:false}
            end
        else
            render json: {status:401, success:false}
        end
    end
end
