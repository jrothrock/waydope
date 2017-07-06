class Api::V1::Technology::TechnologyController < ApplicationController
    include ActionView::Helpers::NumberHelper
    include ActionView::Helpers::DateHelper
	def index
    end
    def read
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user && user.admin
		    technology = ::Product.where("post_type = 'technology' AND url = ?  AND main_category = ? AND sub_category = ?", request.headers["id"], request.headers["maincategory"], request.headers["subcategory"]).first.as_json(include: :photos)
        else
            technology = ::Product.where("post_type = 'technology' AND url = ?  AND main_category = ? AND sub_category = ?", request.headers["id"], request.headers["maincategory"], request.headers["subcategory"]).select_with(App.getGoodColumns('technology',false,nil,true)).first.as_json(include: :photos)
        end
		if technology
            if !technology["removed"]
                if user
                    technology["user_liked"] = technology["likes"].key?(user.uuid) ? true : false
                    technology["user_voted"] = technology["votes"].key?(user.uuid) ? technology["votes"][user.uuid] : nil
                    technology["user_rated"] = technology["ratings"].key?(user.uuid) ? true : false
                end
                technology["properties"].each do |key, val|
                    val.each do |key1,val1|
                        if(key1 != 'width' && key1 != 'depth' && key1 != 'height')
                            val1["price"] =  number_to_currency(val1["price"])
                        end
                    end
                end
                technology["price"] = number_to_currency(technology["price"])
                technology["sale_price"] = nil
                technology["shipping"] = number_to_currency(technology["shipping"])
                technology["time_ago"] = time_ago_in_words(technology["created_at"]) + ' ago'
                technology["votes"] = nil
                technology["ratings"] = nil
                technology["likes"] = nil
                technology["report_users"] = nil
                render json: {status:200, success:true, post:technology.as_json.except("id")}
                user_id = user ? user.id : nil
                ViewcountWorker.perform_async(technology["uuid"],user_id,'technology',request.remote_ip)
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
            technology = ::Product.new # idk.
            technology.title = params[:title] ? params[:title] : "temp-#{time}"
            technology.creator = params[:creator] ? params[:creator] : "temp-#{time}"
            technology.zip = params[:zip] ? params[:zip] : "temp-#{time}"
            # if (params[:file] && params[:post_type].to_i == 1)
			# 	puts 'here2'
			# 	technology.photos = params[:file]
			# 	technology.form = 1
			# elsif params[:post_type].to_i == 0
			# 	puts 'here3'
			# 	technology.form = 0
			# else 
			# 	puts 'here1'
			# 	render json: {status:400,success:false, message:'need post_type parameter'}
			# 	return false
			# end
            technology.user_id = user.id
            technology.post_type = 'technology'
            technology.condition = params[:condition] ? params[:condition] : "temp-#{time}"
            technology.main_category = params[:main_category] ? params[:main_category] : "temp-storage-category"
            technology.sub_category = params[:sub_category] ? params[:sub_category] : "temp storage category"
            technology.has_variations = params[:has_variations] ? params[:has_variations] : "temp-#{time}"
            technology.description = params[:description] ? params[:description] : "temp-#{time}"
            technology.stripped = params[:marked] ? ActionView::Base.full_sanitizer.sanitize(params[:marked]) : "" ## remove all html tags
			technology.marked = params[:marked] ? ActionController::Base.helpers.sanitize(params[:marked]) : "" ## remove scripts and on* javascript
            technology.has_site = params[:has_site] ? params[:has_site] : false
            technology.creator_link = params[:link] ? params[:link] : ""
            technology.color = params[:color] ? params[:color] : "temp-#{time}"
            technology.size = params[:size] ? params[:size] : ""
            technology.height = params[:height] ? params[:height] : 0
            technology.width = params[:width] ? params[:width] : 0
            technology.depth = params[:depth] ? params[:depth] : 0
            technology.quantity = params[:quantity] ? params[:quantity] : 0
            technology.condition = params[:condition] ? params[:condition] : 'nwb'
            technology.turnaround_time = params[:turnaround_time] ? params[:turnaround_time] : 0
            technology.returns = params[:returns] ? params[:return] : false
            technology.properties = params[:properties] ? params[:properties] : {}
            technology.shipping = params[:shipping] ? '%.2f' % params[:shipping].to_f : nil
            technology.shipping_type = params[:shipping_type] ? params[:shipping_type] : "temp-#{time}"
            technology.sale_price = '%.2f' % params[:sale_price].to_f
            technology.average_vote = 1
			technology.votes = {user.uuid => 1}
            technology.likes = {user.uuid => true}
            technology.human_votes = {user.uuid => 1}
            technology.human_likes = {user.uuid => true}
            technology.email = user.email
            technology.stripe_id = user.stripe_id
            technology.flagged = true
            technology.uuid = Product.setUUID
			technology.upvotes = 1
			technology.votes_count = 1
            technology.likes_count = 1
            technology.flagged = false
            technology.removed = false
			technology.og_url_name = params[:title] ? params[:title].parameterize.gsub('_','-') : "temp-#{time}"
            if params[:title]
			    technology.url = Product.findUrl(technology,'technology')
            else
                technology.url = technology.og_url_name
            end
            technology.sold_out = true
            if technology.properties
                prices = []
                begin
                    technology.properties.each do |size,val|
                        val.each do |color,value|
                            if(color !='height' && color != 'width' && color !='depth')
                                if technology.sold_out && value["quantity"].to_i > 0
                                    technology.sold_out = false
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
            technology.max_price = prices.length && prices.max != nil ? '%.2f' % prices.max : "0.00"
            technology.min_price = prices.length && prices.min != nil ? '%.2f' % prices.min : "0.00"
            # don't know why i need to zero. ruby being dumb. remove it and watch some bullshit
            technology.price = prices.length != 0 ?  '%.2f' % (prices.sum / prices.length) : 0
            technology.submitted_by = user.username
            if technology.save
				render json: {status:200, success:true, id:technology.uuid, stage:(user.admin ? 3 : user.info_stage), url:technology.url}
                user_hash = user.technology
                user_hash[technology.uuid] = true
                user.technology = user_hash
				user.average_vote = ((user.average_vote * user.votes_count) + 1)/(user.votes_count + 1)
                if user.technology_votes
                    votes_hash = user.technology_votes
                    votes_hash[technology.uuid] = 1
                    user.technology_votes = votes_hash
                else
                    user.technology_votes = {technology.uuid => 1}
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
            technology = params[:id] ? ::Product.where("uuid = ?", params[:id]).first : nil
            if technology
                if !params[:properties] || !params[:properties].as_json.is_a?(Hash) || params[:properties].as_json.each.map{|key,value| value.is_a?(Hash)}.include?(false) || params[:properties].as_json.each.map{|key,value|value.each.map{|key_inner,value_inner| if(value_inner.is_a?(Hash)) then value_inner.keys.map(&:to_s) end}}.flatten.compact.uniq.sort != ["price","quantity"]
                    render json:{status:400, success:false, message:'Pinche. The properties param is required, and must be an object/hash, with the style being = {"size"=>{*height:optional, *width:optional, *size:optional, "color"=>{price:price, quantity:quantity}}}.'}
                    return false
                end
                technology.og_url_name = params[:title] ? params[:title].parameterize.gsub('_','-') : technology.og_url_name
                technology.main_category = params[:main_category] ? params[:main_category] : technology.main_category 
                technology.sub_category = params[:sub_category] ? params[:sub_category] : technology.sub_category
                technology.creator = params[:creator] ? params[:creator] : technology.creator
                technology.url = Product.findUrl(technology,'technology',params[:title],params[:creator])
                technology.title = params[:title] ? params[:title] : technology.title
                technology.zip = params[:zip] ? params[:zip] : technology.zip
                geo = params[:zip] ? Geokit::Geocoders::MultiGeocoder.geocode(params[:zip].to_s) : nil
                if geo && geo.success
                    technology.state = geo.state 
                    technology.city = geo.city 
                end
                technology.condition = params[:condition] ? params[:condition] : technology.condition
                technology.has_variations = params[:has_variations] ? params[:has_variations] : technology.has_variations
                technology.description = params[:description] ? params[:description] : technology.description
				technology.stripped = params[:marked] ? ActionView::Base.full_sanitizer.sanitize(params[:marked]) : technology.stripped ## remove all html tags
				technology.marked = params[:marked] ? ActionController::Base.helpers.sanitize(params[:marked]) : technology.marked	## remove scripts and on* javascript
                technology.has_site = params[:has_site] ? params[:has_site] : technology.has_site
                technology.form = params[:form] ? params[:form] : technology.form
                technology.condition = params[:condition] ? params[:condition] : technology.condition
                technology.color = params[:color] ? params[:color] : technology.color
                technology.size = params[:size] ? params[:size] : technology.size
                technology.height = params[:height] ? params[:height] : technology.height
                technology.width = params[:width] ? params[:width] : technology.width
                technology.depth = params[:depth] ? params[:depth] : technology.depth
                technology.quantity = params[:quantity] ? params[:quantity] : technology.quantity
                technology.turnaround_time = params[:turnaround_time] ? params[:turnaround_time] : technology.turnaround_time
                technology.returns = params[:returns] ? params[:returns] : technology.returns
                technology.old_properties = technology.properties
                technology.properties = params[:properties] ? params[:properties] : technology.properties
                technology.shipping = params[:shipping] ? '%.2f' % params[:shipping].to_f : technology.shipping
                technology.shipping_type = params[:shipping_type] ? params[:shipping_type] : technology.shipping_type
                technology.creator_link = params[:link] ? params[:link] : technology.creator_link
                technology.sale_price = params[:sale_price] ? '%.2f' % params[:sale_price].to_f : technology.sale_price
                technology.approved = user.approved_seller
                technology.email = user.email
                technology.stripe_id = user.stripe_id
                technology.waydope = user.admin
                technology.updated = true
                technology.sold_out = true
                prices = []
                begin
                    params[:properties].each do |size,val|
                        val.each do |color,value|
                            if(color !='height' && color != 'width' && color !='depth')
                                if technology.sold_out && value["quantity"].to_i > 0
                                    technology.sold_out = false
                                end
                                prices << value["price"].to_f
                            end
                        end
                    end
                rescue => e
                    render json:{status:400, success:false, message:'You know what you did. Please only pass in a properties value that looks like such -> {"size"=>{*height:optional, *width:optional, *size:optional, "color"=>{price:price, quantity:quantity}}}.'}
                    return false
                end
                technology.max_price = prices.length ? '%.2f' % prices.max : 0.00
                technology.min_price = prices.length ? '%.2f' % prices.min : 0.00
                technology.price = '%.2f' % (prices.sum / prices.length)
                seller = Seller.where('user_id = ?', user.id).first_or_create(:user_id => user.id)
                technology.seller_id = seller.id
                new_sort = params[:sorted_ids]
                ids = technology.photos.map {|p| p.uuid }
                if params[:sorted] && new_sort.sort == ids.sort
                    technology.sorted = true
                    technology.sorting = new_sort
                    if technology.upload_urls
                        lookup = {}
                        technology.sorting.each_with_index {|item,index| lookup[item] = index}
                        technology.upload_urls = technology.upload_urls.sort_by { |url| lookup.fetch(url.split('photo')[2].split('/')[4])} # split that mufucka up.
                    end
                end
                if technology.uploaded && ids.length >= new_sort.length
                    new_photo = true    
                end
                begin 
                    technology.save!
                    render json: {status:200, success:true, url:technology.url}
                    sleep 2
                    if !technology.uploaded then ProductuploadWorker.perform_async end
                    if new_photo then ProductphotouploadWorker.perform_async(technology.id) end
                    PurgecacheWorker.perform_async(technology.post_type,technology.uuid)
                rescue ActiveRecord::StaleObjectError
                    render json:{status:422, success:false, message:'Stale Object error, this product has most likely been updated recently.'} 
                rescue ActiveRecord::RecordInvalid => exception
                    render json: {status:500, success:false}
                    Rails.logger.info(technology.errors.inspect)
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
			technology = params[:id] ? ::Product.where("uuid = ?", params[:id]).first : nil
            if technology
                technology.destroy
                render json:{status: 203, success:true}
                # may want to change this to just hide, keep the data, like everything else.
            else
                render json: {status:404, success:false}
            end
        else
            render json: {status:401, success:false}
        end
    end
end
