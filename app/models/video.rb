require "#{Rails.root}/app/uploaders/video_uploader"
require 'carrierwave'
require 'streamio-ffmpeg'
require 'rubygems'
require 'active_support/core_ext/numeric/time'
require 'action_view'
require 'action_view/helpers'
require 'json'
class Video < ApplicationRecord
	# belongs_to :user
	include PgSearch
	include ActionView::Helpers::DateHelper
	# has_many :comments, as: :commentable, dependent: :delete_all
	belongs_to :searchable, polymorphic: true
	validates :title, :categories, :main_category, :link, :url, :link_type, :user_id,presence: true
	mount_uploader :video, VideoUploader
	mount_uploader :artwork, ArtworkUploader

	multisearchable :against => [:title, :submitted_by, :main_category, :post_type, :description],
							 :if => lambda { |record| record.removed === false && record.flagged === false }

	pg_search_scope(
		:search,
		against: {
		title: 'A',
		main_category: 'B',
		description: 'C'
		},
		using: {
			tsearch: {
				dictionary: "english",
			}
		}
	)


	def self.sanitizeLink(link) #this can definitely be refined and made better
		puts link
		puts !!link.match(/<script*/) || !!link.match(/script>/)
		puts !!link.match(/^<iframe*/) && !!link.match(/youtube|liveleak|streamable/)
		puts !!(link.match(/^http*/)) && !!(link.match(/imgur|youtube|streamable/))
		if !!link.match(/<script*/) || !!link.match(/script>/) 
			puts 'return false - first'
			return false			
		elsif  !!(link.match(/https:\/\/(www\.)?youtube\.com/) || !!link.match(/https:\/\/(www\.)?streamable\.com/) || (!!(link.match(/i.imgur\.com/) && link.match(/.gifv$/))))
			puts 'return 1'
			return 1
		elsif ( !!(link.match(/^http*/)) && !!(link.match(/i.imgur\.com/) && !!link.match(/.gif?$/)))
			puts 'return 2'
			return 2
		else
			puts 'return false - last'
			return false
		end
	end

	def self.sanitizeUpload(link)
		allowed_mimes = ['video/quicktime','video/x-msvideo','video/x-ms-wmv', 'video/ogg','video/mpeg', 'video/mp4','video/avi', 'video/H264', 'video/m4v', 'video/x-m4v', 'video/divx']
		## https://stackoverflow.com/questions/4600679/detect-mime-type-of-uploaded-file-in-ruby -- may want to check this for better mime typing.
		if (allowed_mimes.include? MIME::Types.type_for(link).first.content_type)
			return true
		else 
			return false
		end
	end

	def self.getFileType(path)
		ext = File.extname(path)
		puts ext
		mime = IO.popen(["file", "--brief", "--mime-type", path], in: :close, err: :close) { |io| io.read.chomp }
		puts 'mime'
		puts mime
		#again, include? loops -  may want to chage to hash in the future.
		allowed_mimes = ['video/quicktime','video/x-msvideo','video/x-ms-wmv', 'video/ogg','video/mpeg', 'video/mp4','video/avi', 'video/H264', 'video/m4v', 'video/x-m4v', 'video/divx']
		case ext
		when '.mov'
			### allowed_mimes is used instead of just checking the type as people may just change the extension on their computer without any malicious intent.
			if allowed_mimes.include? mime
				return 'mov'
			else 
				return false
			end
		when '.ogg'
			if allowed_mimes.include? mime
				return 'ogg'
			else 
				return false
			end
		when '.ogv'
			if allowed_mimes.include? mime
				return 'ogg'
			else 
				return false
			end
		when '.mp4'
			if allowed_mimes.include? mime
				return 'mp4'
			else 
				return false
			end
		when '.m4v'
			if allowed_mimes.include? mime
				return 'm4v'
			else 
				return false
			end
		when '.wmv'
			if allowed_mimes.include? mime
				return 'wmv'
			else 
				return false
			end
		when '.mkv'
			if allowed_mimes.include? mime
				return 'wmv'
			else 
				return false
			end
		else
			return false
		end
	end

	def self.find_by_category(category,limit=nil,offset=nil)
	 	# video = Video.where("worked = true AND categorized = true AND main_category = ?", category).order("average_vote DESC").limit(limit).offset(offset)
	 	#video = Video.where("worked = true AND category = ?", category).order("freshness DESC").limit(count)
		sanitized_query = Video.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE worked = true AND categorized = true AND uploaded = true AND main_category = ? AND flagged = false AND removed = false GROUP BY v.id ORDER BY average_vote DESC, created_at DESC OFFSET ? LIMIT ?", category,offset,limit]) 
		videos = Video.find_by_sql(sanitized_query)
		return videos
	end

	def self.getnoEmbed(link)
		req = Typhoeus.get("https://noembed.com/embed?url=#{URI.encode(link)}", followlocation: true)
		response = JSON.parse(req.body)
		if response && !response["error"]
			html = response["html"].gsub(/(\"\s?#{response["width"]}\"|\"\s?#{response["height"]}\")/,'"100%"')
			# this needs to be worked on
			post_link = html
			return [html, response["thumbnail_url"], post_link]
		else
			return false
		end
	end


	def self.setUUID
		begin 
		uuid = SecureRandom.hex(5)
		uuid[0] = '' # bring string down to 9 characters
		if(Video.unscoped.where("uuid = ?", uuid).any?) then raise 'Go buy some lotto tickets, product UUID has a duplicate!' end
		return uuid
		rescue
			retry
		end
	end

	# def self.getEmbedly(url)
	# 	# embedly_api = Embedly::API.new :key => Rails.application.secrets.embedly_api_key, :user_agent => 'Mozilla/5.0 (compatible; waydope/1.0)'
	# 	embedly_api = Embedly::API.new :key => 'dc25760714074fbcba5bcac2ef9fb8c1', :user_agent => 'Mozilla/5.0 (compatible; waydope/1.0)'
	# 	obj = embedly_api.oembed :url => url, height: '100%', width: '100%', secure: true
	# 	if obj[0] && !obj[0].error_code && obj[0].type != 'link' && obj[0].html
	# 		html = obj[0].html.gsub "\"100\"","\"100%\""
	# 		post_link = html.sub '%26autoplay%3D1', ''
	# 		return [html, obj[0].thumbnail_url, post_link]
	# 	else
	# 		return false
	# 	end
	# end

	def self.uploadEmbededPhoto(video)
		key = Rails.application.secrets.aws_access_key_id
		secret =  Rails.application.secrets.aws_secret_access_key
		credentials = Aws::Credentials.new(key, secret)
		s3 = Aws::S3::Resource.new(region: 'us-west-2', credentials: credentials)
		bucket = Rails.application.secrets.aws_bucket
		photo_path = "#{Rails.root}/public#{video.artwork.url}"
		time = Time.now.strftime("%S%M%HT%d%m%Y")

		if App.nsfwCheck(photo_path)
			nsfw_check = true
			video.nsfw = true
			photo_path_nsfw = App.nsfwImage(photo_path)
			upload_nsfw = s3.bucket(bucket).object("#{video.artwork.store_dir}/#{name}_artwork_#{time}.png")
		
			# Upload it      
			upload_nsfw.upload_file(photo_path_nsfw)
		end
		upload = s3.bucket(bucket).object(video.artwork.url.sub('/',''))
		upload.upload_file(photo_path)
		if Rails.env.production? 
			if video.nsfw 
				address = upload_nsfw.public_url.to_s.split('.com')[1]
				return "https://#{Rails.application.secrets.cdn}.waydope.com#{address}"
			else
				return "https://#{Rails.application.secrets.cdn}.waydope.com/#{video.artwork.store_dir}/#{name}_artwork_#{time}.png"
			end
		else
			
			if video.nsfw 
				return upload_nsfw.public_url.to_s
			else
				return upload.public_url.to_s
			end
		end
	end

	def self.saveEmbedPhoto(link,video,type)
		puts 'in save embed photo'
		puts 'in save embed photo3'
		download = open(link)
		puts download
		file = Tempfile.new(["video_or_gif_#{Time.now.to_i}", ".#{type}"])
		IO.copy_stream(download, file.path)
		output = "#{File.dirname(file)}/output.jpg"
		img_go = %x[ffmpeg -ss 00:00:00 -i #{file.path} -vframes 1 -q:v 2 #{output}]

		compressed = File.new(output)
		video.artwork = compressed
		puts video.artwork
		download.close
	end

	def self.embed(link,video)
		if !!(link.match(/youtube\.com/))
			if !link.match(/^<iframe*/)
				return getnoEmbed(link)
				# video = link.split('=').last
				# new_link = '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + video +'?autoplay=1"></iframe>'
				# new_link_post = '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + video +'"></iframe>'
				# artwork_url = 'https://i1.ytimg.com/vi/'+video+'/hqdefault.jpg'
				# return [new_link,artwork_url,new_link_post]
			else
				new_link = link.gsub(/width="..."/,'width="100%"').gsub(/height="..."/,'height="100%"')
				return [new_link,nil,new_link]
			end
		elsif (link.match(/liveleak\.com/) && link.match(/^<iframe*/))
			new_link = link.gsub(/width="..."/,'width="100%"').gsub(/height="..."/,'height="100%"')
			return [new_link,nil,new_link]
		elsif link.match(/imgur\.com/) && link.match(/.gif$/)
			# Video.saveEmbedPhoto(link,video,'gif')
			photo = link.gsub('.gif','b.png')
			return [link,photo,link]
		elsif link.match(/imgur\.com/) && link.match(/.gifv$/)
			html = "<a href='#{link}' target='_blank' rel='noopener noreferrer' ><video preload='auto' autoplay='autoplay' loop='loop' class='videos-post-container' style='width:100%;text-align:center;height:100%'>
						<source src='#{link.gsub('.gifv','.mp4')}' type='video/mp4'>
					</video></a>"
			puts 'in gifv'
			photo = link.gsub('.gifv','b.png')
			Video.saveEmbedPhoto(link.gsub('.gifv','.mp4'),video,'mp4')
			return [html,photo,html]
		elsif link.match(/streamable.com/)
			links = getnoEmbed(link)
			html = "<a href='#{link}' target='_blank' rel='noopener noreferrer'>
						<iframe src='#{!link.match(/\/o\//) ? link.gsub("https://","").split("/").unshift("https://").insert(2, "/o/").join("") : link}' preload='auto' autoplay='autoplay' loop='loop' class='videos-post-container' style='width:100%;text-align:center;height:100%;color:transparent !important; border:none'></iframe>
					</iframe></a>"
			new_links = links.map do |link|
				if link
					link.gsub(/\\"/,'"').gsub(/(\n|\\n)/,"")
				end
			end
			return [html,new_links[1],html]
		else
			return getnoEmbed(link)
		end	
	end
	
	def self.userCheck(videos,header)
		if header
			user = User.find_by_token(header.split(' ').last)
			videos.each do |category|
				category.each do |video|
					if user
						video["user_liked"] = video["likes"] && video["likes"].key?(user.uuid) ? true : false
						video_votes_hash = video["votes"]
						video["user_voted"] = video_votes_hash.key?(user.uuid) ? video_votes_hash[user.uuid] : nil
					end
					video["time_ago"] = time_ago_in_words(video["created_at"]).gsub('about ','') + ' ago'
				end
			end
		end
		return videos	
	end
	
	def self.transcode(video,path,title)

		movie = FFMPEG::Movie.new(path)
		fd = File.dirname(path)
		directory = "public" + fd
		unless File.directory?("#{Rails.root}/public/#{video.artwork.store_dir}")
			FileUtils.mkdir_p("#{Rails.root}/public/#{video.artwork.store_dir}")
		end
		Dir.chdir("#{Rails.root}/public/#{video.artwork.store_dir}")
		type = Video.getFileType(path)
		#
		#from my initial tests, I have found that streamio produces a more compressed video than h264. This maybe due to them using h265. Will have to look into it.
		#
		file_name = File.basename(path)  
		mp4 = "#{fd}/#{file_name.split('.').insert(1,'reduced').join('.').gsub(/#{type}$/, 'mp4')}"
		puts mp4
		# ffmpeg -i tears_of_steel_1080p.mov -c:v libx264 -crf 30 -preset superfast -threads 1 -c:a aac -b:a 128k -movflags +faststart -vf copy output_test9_bad.mp4

		# do a split and stitch. This maybe more scalable, and faster, in the long run.

		#ffmpeg -i #{path} -c copy -f segment -segment_time (math (ffprobe -i tears_of_steel_1080p.mov -show_entries format=duration -v quiet -of csv="p=0")/4) -segment_list tet.txt  -reset_timestamps 1  testfile_piece_%02d.mp4
			# this script below has an issue where the pid isn't being killed. Basically it needs a SIGINT once it's completed.
		# while read FILE; do < /dev/null ffmpeg -i $FILE -c:v libx264 -crf 30 -preset superfast -threads 1 -c:a aac -b:a 128k -movflags +faststart -vf copy output_$FILE & done < tet.txt ; pid =$! wait; kill pid
		# test_h264 = %x[ffmpeg -i #{path} -c:v libx264 -preset veryslow -crf 22 -c:a copy #{mp4}] 
		test_h264 = %x[ffmpeg -i #{path} -c:v libx264 -preset superfast -crf 24 -strict -2 -movflags +faststart -s 1280x534 -c:a aac -b:a 128k #{mp4}] 
		# options = {
		# 	video_codec: "libx264", x264_preset: "superfast",
		# 	threads: 2, custom: %w(-crf 30 -c:a aac -b:a 128k -movflags +faststart)
		# }
		# transcoded_movie = movie.transcode("#{fd}/#{title}_reduced.mp4",options)
		video_file = File.new("#{fd}/#{title}.reduced.mp4")
		length = %x[ffprobe -i #{path} -show_entries format=duration -v quiet -of csv="p=0"]
		movie.screenshot("#{fd}/#{title}.jpg", seek_time: (length.to_f/4).floor)
		image_file = File.new("#{fd}/#{title}.jpg")
		video.artwork = image_file
		video.save
		length
	end

	def self.removeDir(video)
		["#{Rails.root}/public/#{video.video.store_dir}","#{Rails.root}/public/#{video.artwork.store_dir}"].each do |directory|
			if File.directory?(directory)
				FileUtils.rm_rf(directory)
			end
		end
	end

	def self.findUrl(video,title)
		if !title || title != video.title || !video.url
			if !Video.exists?(url: video.og_url_name, main_category: video.main_category)
				return video.og_url_name
			elsif !Video.exists?(url: "#{video.og_url_name}-#{video.main_category.parameterize.gsub('_','-')}", main_category: video.main_category)
				return "#{video.og_url_name}-#{video.main_category.parameterize.gsub('_','-')}"
			elsif !Video.exists?(url: "#{video.og_url_name}-#{video.submitted_by.parameterize.gsub('_','-')}", main_category: video.main_category)
				return "#{video.og_url_name}-#{video.submitted_by.parameterize.gsub('_','-')}"
			elsif !Video.exists?(url: "#{video.og_url_name}-#{Time.now.strftime('%m%d%Y')}", main_category: video.main_category)
				return "#{video.og_url_name}-#{Time.now.strftime('%m%d%Y')}"
			elsif !Video.exists?(url: "#{video.og_url_name}-#{Time.now.strftime('%H%MT%m%d%Y')}", main_category: video.main_category)
				return "#{video.og_url_name}-#{Time.now.strftime('%H%MT%m%d%Y')}"
			else
				#this will most likely never result in a collision, and if it does, it was purposeful, and they'll just receive the first one
				return "#{video.og_url_name}-#{Time.now.strftime('%H%M%ST%m%d%Y')}"
			end
		else
			return video.url
		end
		
	end
	

	def self.deleteAmazon(video)
		key = Rails.application.secrets.aws_access_key_id
		secret =  Rails.application.secrets.aws_secret_access_key
		credentials = Aws::Credentials.new(key, secret)
		s3 = Aws::S3::Resource.new(region: 'us-west-2', credentials: credentials)
		puts video.as_json
		puts 'break'
		puts 'break'
		puts video.video.as_json
		bucket = Rails.application.secrets.aws_bucket
		puts video.upload_url
		if video.upload_url
			video = s3.bucket(bucket).object("#{video.upload_url.split('.com/')[1]}")
			video.delete
		else
			s3.bucket(bucket).objects({prefix:"uploads/video/video/#{video.id}"}).each do |object|
				 object.delete
			end
		end	
		if video.upload_artwork_url
			artwork = s3.bucket(bucket).object("#{video.upload_artwork_url.split('.com/')[1]}")
			artwork.delete
		else
			s3.bucket(bucket).objects({prefix:"uploads/video/artwork/#{video.id}"}).each do |object|
				 object.delete
			end
		end
	end

	def self.uploadVideo(video,name,s3,length)

		file_path = "#{Rails.root}/public/#{video.video.store_dir}/#{name}.reduced.mp4"
		artwork_path = "#{Rails.root}/public#{video.artwork.url}"
		bucket = Rails.application.secrets.aws_bucket
		time = Time.now.strftime("%S%M%HT%d%m%Y")

		if !video.upload_artwork_url_nsfw  || video.upload_artwork_url_nsfw === ""
			puts 'video has no artwor url'
			if App.nsfwCheck(artwork_path)
				nsfw_thumb = true
				video.nsfw = true
				puts 'product nsfw'
				photo_path_nsfw = App.nsfwImage(artwork_path)
				upload_nsfw = s3.bucket(bucket).object("#{video.artwork.store_dir}/#{name}_artwork_#{time}.png")
			
			# Upload it      
				upload_nsfw.upload_file(photo_path_nsfw)
			else
				movie = FFMPEG::Movie.new(file_path)
				prng = Random.new
				movie.screenshot("#{Rails.root}/temp_check.jpg", seek_time:prng.rand(0...length.to_f.floor))
				temp_file = File.new("#{Rails.root}/temp_check.jpg")
				video.nsfw = App.nsfwCheck("#{Rails.root}/temp_check.jpg")
				FileUtils.rm_rf("#{Rails.root}/temp_check.jpg")
			end
		end
		# Create the object to upload
		#have to remove the first slash as it will create an empty folder in aws.

		file = s3.bucket(bucket).object("#{video.video.store_dir}/#{name}_reduced.mp4")
		if !video.upload_artwork_url then artwork = s3.bucket(bucket).object("#{video.artwork.store_dir}/#{name}_artwork_#{time}.png") end

		# Upload it      
		file.upload_file(file_path)
		if !video.upload_artwork_url then artwork.upload_file(artwork_path) end
		# Save it
		if Rails.env.production? 
			video.upload_url = "https://#{Rails.application.secrets.cdn}.waydope.com/#{video.video.store_dir}/#{name}_reduced.mp4"
			if !video.upload_artwork_url then video.upload_artwork_url = "https://#{Rails.application.secrets.cdn}.waydope.com/#{video.artwork.store_dir}/#{name}_artwork_#{time}.png" end
			if nsfw_thumb && ( !video.upload_artwork_url_nsfw  || video.upload_artwork_url_nsfw === "")
				address = upload_nsfw.public_url.to_s.split('.com')[1]
				video.upload_artwork_url_nsfw = "https://#{Rails.application.secrets.cdn}.waydope.com#{address}"
			end
		else
			video.upload_url = file.public_url.to_s
			if !video.upload_artwork_url then video.upload_artwork_url = artwork.public_url.to_s end
			if nsfw_thumb && ( !video.upload_artwork_url_nsfw  || video.upload_artwork_url_nsfw === "")then video.upload_artwork_url_nsfw = upload_nsfw.public_url.to_s  end
		end
		video.worked = true
		video.save
	end
	
	def self.uploadPhoto(video,s3)
		bucket = Rails.application.secrets.aws_bucket
		photo_path = "#{Rails.root}/public#{video.artwork.url}"
		time = Time.now.strftime("%S%M%HT%d%m%Y")

		if App.nsfwCheck(photo_path)
			nsfw_check = true
			video.nsfw = true
			puts 'product nsfw'
			photo_path_nsfw = App.nsfwImage(photo_path)
			upload_nsfw = s3.bucket(bucket).object("#{video.artwork.store_dir}/#{name}_artwork_#{time}.png")
		
			# Upload it      
			upload_nsfw.upload_file(photo_path_nsfw)
		end
		upload = s3.bucket(bucket).object(video.artwork.url.sub('/',''))
		upload.upload_file(photo_path)
		old_photo = s3.bucket(bucket).object("#{video.upload_artwork_url.split('.com/')[1]}")
		old_photo.delete
		if Rails.env.production? 
			video.upload_artwork_url = video.upload_artwork_url = "https://#{Rails.application.secrets.cdn}.waydope.com/#{video.artwork.store_dir}/#{name}_artwork_#{time}.png"
			if video.nsfw 
				address = upload_nsfw.public_url.to_s.split('.com')[1]
				video.upload_artwork_url_nsfw = "https://#{Rails.application.secrets.cdn}.waydope.com#{address}"
			end
		else
			video.upload_artwork_url = upload.public_url.to_s
			if video.nsfw && upload_nsfw
				video.upload_artwork_url_nsfw = upload_nsfw.public_url.to_s
			elsif video.nsfw
				video.upload_artwork_url_nsfw = upload.public_url.to_s
			end
		end
		video.save
	end

	def self.purge_cache
		$redis = Redis::Namespace.new("way_dope", :redis => Redis.new)
		if $redis.exists("videos_all_keys")
			$redis.lrange("videos_all_keys",0,-1).each do |key|
				$redis.del(key)
			end
			$redis.del("videos_all_keys")
		end
		if $redis.exists("videos_menu_total") && $redis.get("videos_menu_total").to_i < 15
			$redis.lrange("videos_menu_keys",0,-1).each do |key|
				$redis.del(key)
			end
			$redis.del("videos_menu_keys")
		end
		if $redis.exists("home_videos_total") && $redis.get("home_videos_total").to_i < 15
			$redis.lrange("home_type_keys",0,-1).each do |key|
				$redis.del(key)
			end
			$redis.del("home_posts")
			$redis.del("home_type_keys")
		end
	  end

	def self.select_with columns
  		select(columns.map(&:to_s))
	end

end
