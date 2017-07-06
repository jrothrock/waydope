class Product < ApplicationRecord
    include PgSearch
	include ActionView::Helpers::NumberHelper
    has_many :photos,  -> { select("uuid","photo","created_at") }, as: :photoable, dependent: :delete_all
    accepts_nested_attributes_for :photos
    belongs_to :searchable, polymorphic: true
    validates_length_of :photos, maximum: 4
    multisearchable :against => [:title, :creator, :sub_category, :main_category, :description],
							 :if => lambda { |record| record.removed === false && record.flagged === false }

     pg_search_scope(
		:search,
		against: {
		title: 'A',
		sub_category: 'B',
		main_category: 'C',
        description: 'D'
		},
		using: {
			tsearch: {
				dictionary: "english",
			}
		}
	)

    def self.sanitizeUpload(type)
		allowed_mimes = ['image/jpg','image/jpeg','image/png', 'image/gif']
		puts 'type'
		puts type
		## https://stackoverflow.com/questions/4600679/detect-mime-type-of-uploaded-file-in-ruby -- may want to check this for better mime typing.
		if allowed_mimes.include? type
			return true
		else 
			return false
		end
	end

	  def self.setUUID
			begin 
			uuid = SecureRandom.hex(5)
			uuid[0] = '' # bring string down to 9 characters
			if(Product.unscoped.where("uuid = ?", uuid).any?) then raise 'Go buy some lotto tickets, product UUID has a duplicate!' end
			return uuid
			rescue
				retry
			end
		end

	def self.checkSoldOut(properties)
		sold_out = true
		properties.each do |size, value|
			value.each do |color,value1|
				if(color != 'width' && color != 'depth' && color != 'height')
					if properties[size][color]["quantity"].to_i > 0
						sold_out = false
					end
				end
			end
		end
		return sold_out
	end

	def self.userCheck(products, header)
		user = header ? User.find_by_token(header.split(' ').last) : nil
			products.each do |category|
				category.each do |product|
					if user
						product["user_liked"] = product["likes"].key?(user.uuid) ? true : false
						product_votes_hash = product["votes"]
						product["user_voted"] = product_votes_hash.key?(user.uuid) ? product_votes_hash[user.uuid] : nil
					end
					product["price"] = ActionController::Base.helpers.number_to_currency(product["price"])
					product["sale_price"] = nil
                	#product["sale_price"] = ActionController::Base.helpers.number_to_currency(product["sale_price"])
                	product["shipping"] = ActionController::Base.helpers.number_to_currency(product["shipping"])
				end
			end
		return products
	end

	def self.findUrl(product,type,title=nil,creator=nil)
		### This could be improved by doing one query using like and checking against those results, but for now, this is fine
		if !title || title != product.title
			count = Product.where("og_url_name = ? AND main_category = ? AND sub_category = ? AND post_type = ?", product.og_url_name, product.main_category, product.sub_category, type).count
			if !Product.exists?(url: product.og_url_name, main_category: product.main_category)
				return product.og_url_name
			elsif !product.og_url_name.include?(product.creator) && !Product.exists?(url: "#{product.creator.parameterize.gsub('_','-')}-#{product.og_url_name}", main_category: product.main_category, post_type: type, sub_category: product.sub_category)
				return "#{product.creator.parameterize.gsub('_','-')}-#{product.og_url_name}"
			elsif !product.og_url_name.include?(product.creator) && !Product.exists?(url: "#{product.og_url_name}-#{product.creator.parameterize.gsub('_','-')}", main_category: product.main_category, post_type: type, sub_category: product.sub_category)
				return "#{product.og_url_name}-#{product.creator.parameterize.gsub('_','-')}"
			elsif !Product.exists?(url: "#{product.og_url_name}-#{type.parameterize.gsub('_','-')}", main_category: product.main_category, post_type: type, sub_category: product.sub_category)
				return "#{product.og_url_name}-#{type.parameterize.gsub('_','-')}"
			elsif !Product.exists?(url: "#{product.og_url_name}-#{Time.now.strftime('%m%d%Y')}", main_category: product.main_category, post_type: type, sub_category: product.sub_category)
				return "#{product.og_url_name}-#{Time.now.strftime('%m%d%Y')}"
			elsif !Product.exists?(url: "#{product.og_url_name}-#{Time.now.strftime('%H%MT%m%d%Y')}", main_category: product.main_category, post_type: type, sub_category: product.sub_category)
				return "#{product.og_url_name}-#{Time.now.strftime('%H%MT%m%d%Y')}"
			else
				#this will most likely never result in a collision, and if it does, it was purposeful, and they'll just receive the first one
				return "#{product.og_url_name}-#{Time.now.strftime('%H%M%ST%d%m%Y')}"
			end
		else 
			return product.url
		end
	end

	def self.select_with(columns)
  		select(columns.map(&:to_s))
	end

	def self.removeDir(product)
		if product.photos[0] && File.directory?(product.photos[0].photo.store_dir)
			FileUtils.rm_rf(product.photos[0].photo.store_dir)
		end
	end

	def self.uploadPhotos(product,s3)
		bucket = Rails.application.secrets.aws_bucket
		urls = []
		nsfw_urls = []
		ids = []
		photos = []
		photos_nsfw = []
		product.photos.each_with_index do |photo,index|
			photo_path = "#{Rails.root}/public#{product.photos[index].photo.url}"
			if App.nsfwCheck(photo_path)
				product.nsfw = true
				puts 'product nsfw'
				ids.push(index)
				photo_path_nsfw = App.nsfwImage(photo_path)
				puts photo_path
				puts photo_path_nsfw
				photos << photo_path
				photos_nsfw << photo_path_nsfw
				upload_nsfw = s3.bucket(bucket).object(photo_path_nsfw.split('waydope/public/')[1])
			
				# Upload it      
				upload_nsfw.upload_file(photo_path_nsfw)
			end
			# Create the object to upload
			#have to remove the first slash as it will create an empty folder in aws.

			upload = s3.bucket(bucket).object(product.photos[index].photo.url.sub('/',''))
			
			# Upload it      
			upload.upload_file(photo_path)

			if Rails.env.production? 
				urls << "https://#{Rails.application.secrets.cdn}.waydope.com#{upload.public_url.to_s.split('.com')[1]}"
				if upload_nsfw
					address = upload_nsfw.public_url.to_s.split('.com')[1]
					nsfw_urls << "https://#{Rails.application.secrets.cdn}.waydope.com#{address}"
				else
					nsfw_urls << "https://#{Rails.application.secrets.cdn}.waydope.com#{upload.public_url.to_s.split('.com')[1]}"
				end
			else
				urls << upload.public_url.to_s
				if upload_nsfw && upload_nsfw.public_url
					nsfw_urls << upload_nsfw.public_url.to_s
				else
					nsfw_urls << upload.public_url.to_s
				end
			end
		end
		puts 'product nsfw'
		puts product.nsfw

		puts 'image paths'
		puts 'sfw'
		puts photos
		puts 'nsfw'
		puts photos_nsfw

		product.nsfw_flag = product.nsfw ? true : false
		# Save it
		if product.sorted
			lookup = {}
			product.sorting.each_with_index {|item,index| lookup[item] = index}
			product.upload_urls = urls.sort_by { |url| lookup.fetch(url.split('photo')[2].split('/')[4])} # split that mufucka up.
			if product.nsfw then product.upload_urls_nsfw = urls.sort_by { |url| lookup.fetch(url.split('photo')[2].split('/')[4])} end
		else
			product.upload_urls = urls.reverse # needs to be reversed
			if product.nsfw then product.upload_urls_nsfw = nsfw_urls.reverse end
		end
		if ids.length then
			product.upload_artwork_url_nsfw_ids = ids
		end
		product.uploaded = true
		product.worked = true
		# begin 
		product.save
			# rescue ActiveRecord::StaleObjectError
				# retry
		# end
		Product.purge_cache(product.post_type)
	end

	def self.uploadPhoto(product,not_uploaded,s3)
		bucket = Rails.application.secrets.aws_bucket
		urls = product.upload_urls
		nsfw_urls = product.upload_urls_nsfw
		ids = product.upload_artwork_url_nsfw_ids
		index = product.photos.map(&:uuid)
		not_uploaded.each_with_index do |id,ind|
			photo_path = "#{Rails.root}/public#{product.photos[index.index(id)].photo.url}"
			# Create the object to upload
			#have to remove the first slash as it will create an empty folder in aws.

			if App.nsfwCheck("#{Rails.root}/public#{product.photos[index.index(id)].photo.url}")
				product.nsfw = true
				ids.push(index)
				photo_path_nsfw = App.nsfwImage(photo_path)
				upload_nsfw = s3.bucket(bucket).object(photo_path_nsfw.split('waydope/public/')[1])
			
			# Upload it      
				upload_nsfw.upload_file(photo_path_nsfw)
			end

			upload = s3.bucket(bucket).object(product.photos[index.index(id)].photo.url.sub('/',''))

			# Upload it      
			upload.upload_file(photo_path)

			if Rails.env.production? 
				urls << "https://#{Rails.application.secrets.cdn}.waydope.com#{product.photos[index.index(id)].photo.url}"
				if upload_nsfw
					address = upload_nsfw.public_url.to_s.split('.com')[1]
					nsfw_urls << "https://#{Rails.application.secrets.cdn}.waydope.com#{address}"
				else
					nsfw_urls << "https://#{Rails.application.secrets.cdn}.waydope.com#{product.photos[index.index(id)].photo.url}"
				end
			else
				urls << upload.public_url.to_s
				if upload_nsfw
					nsfw_urls << upload_nsfw.public_url.to_s
				else
					nsfw_urls << upload.public_url.to_s
				end
			end
		end
		if product.sorted
			puts 'urls'
			puts urls
			lookup = {}
			photo_ids = product.photos.map {|p| p.uuid }
			puts 'ids'
			puts photo_ids
			photo_ids.each do |id|
				if(!product.sorting.include?(id.to_s))
					product.sorting << id.to_s
				end
			end
			puts 'sorting'
			puts product.sorting
			product.sorting.each_with_index {|item,index| lookup[item] = index}
			puts 'lookup'
			puts lookup
			product.upload_urls = urls.sort_by { |url| lookup.fetch(url.split('photo')[2].split('/')[4])} # split that mufucka up.
		end
		if ids.length then
			product.upload_artwork_url_nsfw_ids = ids
		end
		trys = 0
		begin 
			# if this needs to be rescued, this things basically fucked. In prod all pictures will become nsfw, if there is one. Shouldn't happen. Hopefully.
			if product.sorted
				product.upload_urls = urls.sort_by { |url| lookup.fetch(url.split('photo')[2].split('/')[4])} # split that mufucka up.
				if product.nsfw then product.upload_urls_nsfw = urls.sort_by { |url| lookup.fetch(url.split('photo')[2].split('/')[4])} end
			else
				product.upload_urls = urls # no need to reverse them here, as they have already been reversed
				if product.nsfw then product.upload_urls_nsfw = nsfw_urls.reverse end
			end
			if product.save
				puts 'saved'
			else
				Rails.logger.info(product.errors.inspect) 
			end
			rescue ActiveRecord::StaleObjectError
				if trys < 3
					product.reload
					trys += 1
					retry
				end
		end
		Product.purge_cache(product.post_type)
	end

	def self.purge_cache(type)
		$redis = Redis::Namespace.new("way_dope", :redis => Redis.new)
		if $redis.exists("#{type}_all_keys")
			$redis.lrange("#{type}_all_keys",0,-1).each do |key|
				$redis.del(key)
			end
			$redis.del("#{type}_all_keys")
		end
		if $redis.exists("#{type}_menu_total") && $redis.get("#{type}_menu_total").to_i < 15
			$redis.lrange("#{type}_menu_keys",0,-1).each do |key|
				$redis.del(key)
			end
			$redis.del("#{type}_menu_keys")
		end
		if $redis.exists("home_#{type}_total") && $redis.get("home_#{type}_total").to_i < 15
			$redis.lrange("home_type_keys",0,-1).each do |key|
				$redis.del(key)
			end
			$redis.del("home_posts")
			$redis.del("home_type_keys")
		end
	end

	def self.rollProductsBack(user,products,products_old_quantities,purchased_already)
		puts products_old_quantities.as_json
        products_old_quantities.each do |id,value|
            begin
				product = products.detect{|product| product.uuid === id}
				puts 'product'
				puts product.as_json
				puts 'poduct broke down'
				puts product
				puts product.properties
				value.each do |size,value1|
					value1.each do |color,value2|
						puts size
						puts color
						product.properties[size][color]["quantity"] = value2
					end
				end
				uuid = user && !user.is_a?(String) ? user.uuid : user
				product.purchasers = product.purchasers.except(uuid)
				if purchased_already.key?(product.uuid) 
					purchasers_hash = product.purchasers
					purchasers_hash[uuid] = purchased_already[product.uuid][uuid]   
					product.purchasers = purchasers_hash
				end
				try = 0 
				product.save
            rescue ActiveRecord::StaleObjectError
                        ### basically, this will only happen if the StaleObjectError has been triggered twice.
                        ### unlikely, but can happen.
						### ALL OF THIS MAYBE POINTLESS
                    puts e
                    if try < 4
                        try += 1
                        product.reload
						product.properties.each do |size,value|
							if products_old_quantities[product.uuid].key?(size)
								value.each do |color,value1|
									if products_old_quantities[product.uuid][size].key?(color)
										products_old_quantities[product.uuid][size][color] = product.quantity
									end
								end
							end
						end
                        if product.purchasers.key?(uuid)
                            purchased_already[product.uuid] =  product.products[uuid]
                        end
                        retry
                    else
                        return false
                    end
            rescue => e
                puts e
				puts e.backtrace
            end
        end
    end

	## Scopes

end
