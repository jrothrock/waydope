require "#{Rails.root}/app/uploaders/song_uploader"
require 'carrierwave'
require 'taglib'
require 'rubygems'
require 'active_support/core_ext/numeric/time'
require 'action_view'
require 'action_view/helpers'
require 'json'
class Song < ApplicationRecord
	include PgSearch
	include ActionView::Helpers::DateHelper
	# has_many :comments, as: :commentable, dependent: :delete_all
	belongs_to :searchable, polymorphic: true
	validates :title, :artist, :main_genre, :genres, :url, :link_type,:user_id,presence: true
	validates :average_rating, :average_advanced_rating, :average_simplified_rating, :average_lyrics_rating, :average_production_rating, :average_originality_rating, length: { in: 0..100 }
	mount_uploader :song, SongUploader
	mount_uploader :artwork, ArtworkUploader

	multisearchable :against => [:title, :artist, :main_genre, :post_type, :description],
                  :if => lambda { |record| record.removed === false && record.flagged === false }

    pg_search_scope(
		:search,
		against: {
		title: 'A',
		main_genre: 'B',
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
		puts !!link.match(/^<iframe*/) && !!link.match(/youtube|soundcloud/)
		puts !!(link.match(/^http*/)) && !!(link.match(/youtube|soundcloud/))
		if !!link.match(/<script*/) || !!link.match(/script>/) 
			puts 'return false - first'
			return false			
		elsif !!link.match(/^<iframe*/) && !!link.match(/youtube|soundcloud/)
			puts 'return 1'
			return 1
		elsif !!(link.match(/^http*/)) && !!(link.match(/youtube|soundcloud/))
			puts 'return 2'
			return 2
		else
			puts 'return false - last'
			return false
		end
	end
	
	def self.sanitizeUpload(type)
		allowed_mimes = ['audio/mpeg','audio/mp3','audio/ogg', 'audio/mp4','audio/vnd.wav', 'audio/mid','audio/wav', 'audio/x-m4a', 'audio/aac', 'audio/m4a']
		puts 'type'
		puts type
		## https://stackoverflow.com/questions/4600679/detect-mime-type-of-uploaded-file-in-ruby -- may want to check this for better mime typing.
		if allowed_mimes.include? type
			return true
		else 
			return false
		end
	end

	def self.find_by_genre(genre, limit=nil, offset=nil)
		# songs = Song.where("worked = true AND categorized = true AND main_genre = ?", genre).order("average_vote DESC").limit(limit).offset(offset)
		sanitized_query = Song.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE worked = true AND categorized = true AND uploaded = true AND main_genre = ? AND flagged = false AND removed = false GROUP BY s.id ORDER BY average_vote DESC, created_at DESC OFFSET ? LIMIT ?", genre,offset,limit]) 
		songs = Song.find_by_sql(sanitized_query)
		 #songs = Song.where("worked = true AND genre = ?", genre).order("freshness DESC").limit(count)
		return songs
	end

	def self.checkRatings(params)
		puts params
		typeFlag = params[:advancedRating] ? true : false
		type = typeFlag ? params[:advancedRating]  : params[:simpleRating]
		message = params[:message] ? params[:message] : nil
		whinyness = params[:whinyness] ? params[:whinyness] : nil
		production = params[:production] ? params[:production] : nil
		originality = params[:originality] ? params[:originality] : nil
		puts type
		if (!type || type > 100 || type < 0)
			puts 'failed in first spot'
			return false
		end
		if (production && (production > 100 || production < 0)) || (originality && (originality > 100 || originality < 0))
				puts 'failed in second spot'
				return false
		end
		return true
	end


	def self.setUUID
		begin 
		uuid = SecureRandom.hex(5)
		uuid[0] = '' # bring string down to 9 characters
		if(Song.unscoped.where("uuid = ?", uuid).any?) then raise 'Go buy some lotto tickets, product UUID has a duplicate!' end
		return uuid
		rescue
			retry
		end
	end

	# this will be used when/if soundcloud accepts us to use their api.
	def self.getSoundcloud
		client = Soundcloud.new(:client_id => 'eae1fbc4877af4e7a0b5acc82c32b16b')

		# get a tracks oembed data
		embed_info = client.get('/oembed', url: link, auto_play:true)

		track = client.get('/resolve', url: link)
		iframe = embed_info['html']
		iframe.sub! '400', '100%' #Soundcloud's api has default_height, but only takes a number - I believe
		post_link = iframe.sub '&auto_play=true', ''

		artwork_url = track["artwork_url"].gsub('http','https')
		return [iframe,artwork_url,post_link]
	end
	def self.getEmbedly(url)
		# embedly_api = Embedly::API.new :key => Rails.application.secrets.embedly_api_key, :user_agent => 'Mozilla/5.0 (compatible; waydope/1.0)'
		embedly_api = Embedly::API.new :key => 'dc25760714074fbcba5bcac2ef9fb8c1', :user_agent => 'Mozilla/5.0 (compatible; waydope/1.0)'
		obj = embedly_api.oembed :url => url, height: '100%', width: '100%', secure: true
		if obj[0] && !obj[0].error_code && obj[0].type != 'link' && obj[0].html
			html = obj[0].html.gsub "\"100\"","\"100%\""
			post_link = html.sub '%26autoplay%3D1', ''
			return [html, obj[0].thumbnail_url, post_link]
		else
			return false
		end
	end
	def self.getnoEmbed(link)
		req = Typhoeus.get("https://noembed.com/embed?url=#{URI.encode(link)}", followlocation: true)
		response = JSON.parse(req.body)
		if response && !response["error"]
			html = response["html"].gsub(/(\"\s?#{response["width"]}\"|\"\s?#{response["height"]}\")/,'"100%"')
			# this needs to be worked on
			post_link = html
			if URI.parse(link).host === 'soundcloud.com' || URI.parse(link).scheme === 'https'
				response["thumbnail_url"] = response["thumbnail_url"].gsub(/http(s)?:\/\//,"https://")
			end
			return [html, response["thumbnail_url"], post_link]
		else
			return false
		end
	end
	def self.embed(link)
		# create a client object with your app credentials
		if !!(link.match(/soundcloud\.com/))
			puts 'it matches soundcloud'
			if !link.match(/^<iframe*/)
				puts 'not an iframe'
				return getnoEmbed(link)
			else 
				puts 'is an iframe'
				return link
			end
		elsif !!(link.match(/youtube/))
			if !link.match(/^<iframe*/)
				'puts not an iframe'
				return getnoEmbed(link)
				# video = link.split('=').last
				# new_link = '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + video +'?autoplay=1"></iframe>'
				# new_link_post = '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + video + '"></iframe>'
				# artworl_url = 'https://i1.ytimg.com/vi/'+video+'/hqdefault.jpg'
				# return [new_link,artworl_url,new_link_post]
			else
				puts 'is in an iframe'
				return link
			end
		else
			return getnoEmbed(link)
		end
	end

	def self.userCheck(songs,header)
		user = header ? User.find_by_token(header.split(' ').last) : nil
		songs.each do |category|
			category.each do |song|
				if user
					song["user_liked"] = song["likes"].key?(user.uuid) ? true : false
					song_votes_hash = song["votes"]
					song["user_voted"] = song_votes_hash.key?(user.uuid) ? song_votes_hash[user.uuid] : nil
				end
				song["time_ago"] = time_ago_in_words(song["created_at"]).gsub('about ','') + ' ago'
			end
		end
		return songs	
	end

	def self.sanitizeTime(time)
		case time
		when 'Day'
			return 1.day.ago
		when 'Week'
			return 1.week.ago
		when 'Month'
			return 1.month.ago
		when 'Year'
			return 1.year.ago
		when 'All Time'
			return 10.year.ago
		else
			return false
		end
	end

	def self.sanitizeOrder(rank, type)
		case rank
		when 'Votes'
			what = 'hotness'
			what2 = 'average_vote DESC'
			what3 = 'created_at DESC'
		when 'Rating'
			what = 'hotness'
			what2 = 'average_rating DESC'
			what3 = 'created_at DESC'
		when 'Likes'
			what = 'likes_count'
			what2 = 'created_at DESC'
		when 'Posts'
			what = 'count'
			what2 = 'created_at DESC'
		when 'Subscribers'
			what = 'subscribers_count'
			what2 = 'created_at DESC'
		when 'Alphabetically'
			what = 'LOWER(title)'
			what2 = 'created_at DESC'
		when 'Newest'
			what = 'created_at'
			type = 'Descending'
		when 'Oldest'
			what = 'created_at'
			type = 'Ascending'
		else
			return false
		end

		case type
		when 'Ascending'
			order = "ASC"
		when 'Descending'
			order = "DESC"
		else
			return false
		end
		return "#{what} #{order}#{what2 ? ', ' + what2 : ''}#{what3 ? ', ' + what3 : ''}"
	end

	# this whole thing may not be useful as amazon does the first blocking,
		# plus, the mime type for s3 ends up being application/octet-stream
	def self.getFileType(path)
		ext = File.extname(path)
		puts ext
		mime = IO.popen(["file", "--brief", "--mime-type", path], in: :close, err: :close) { |io| io.read.chomp }
		puts 'mime'
		puts mime
		#again, include? loops -  may want to chage to hash in the future.
		allowed_mimes = ['audio/mpeg','audio/mp3','audio/ogg', 'audio/mp4','audio/vnd.wav', 'audio/mid','audio/wav', 'audio/x-m4a', 'audio/aac', 'audio/m4a','application/octet-stream']
		case ext
		when '.mp3'
			### allowed_mimes is used instead of just checking the type as people may just change the extension on their computer without any malicious intent.
			if allowed_mimes.include? mime
				return 'mp3'
			else 
				return false
			end
		when '.ogg'
			if allowed_mimes.include? mime
				return 'ogg'
			else 
				return false
			end
		when '.oga'
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
		when '.m4a'
			if allowed_mimes.include? mime
				return 'm4a'
			else 
				return false
			end
		when '.wav'
			if allowed_mimes.include? mime
				return 'wav'
			else 
				return false
			end
		when '.mid'
			if allowed_mimes.include? mime
				return 'mid'
			else 
				return false
			end
		when '.aac'
			if allowed_mimes.include? mime
				return 'aac'
			else
				return false
			end
		else
			return false
		end
	end

	def self.read_tags(song,path,title)
		fileread = TagLib::MPEG::File.new(path)
		puts fileread
		tag = fileread.tag ? fileread.tag : nil
		id3v2_tag = fileread.id3v2_tag ? fileread.id3v2_tag : nil
		puts 'tags read'
		if tag && id3v2_tag
			puts 'has tag'
			cover = id3v2_tag.frame_list('APIC').first
			if cover && cover.picture
				unless File.directory?("#{Rails.root}/public/#{song.artwork.store_dir}")
					FileUtils.mkdir_p("#{Rails.root}/public/#{song.artwork.store_dir}")
				end
				Dir.chdir("#{Rails.root}/public/#{song.artwork.store_dir}")
				newfile= File.new("#{title}.jpg", 'w+')
				newfile.write(cover.picture.force_encoding('UTF-8'))
				# song.nsfw = App.nsfwCheck("#{title}jpg")
				song.artwork = newfile
				newfile.close
			end
		end
		fileread.close 
	end

	def self.removeDir(song)
		["#{Rails.root}/public/#{song.song.store_dir}","#{Rails.root}/public/#{song.artwork.store_dir}"].each do |directory|
			if File.directory?(directory)
				FileUtils.rm_rf(directory)
			end
		end
	end

	def self.deleteAmazon(song)
		key = Rails.application.secrets.aws_access_key_id
		secret =  Rails.application.secrets.aws_secret_access_key
		credentials = Aws::Credentials.new(key, secret)
		s3 = Aws::S3::Resource.new(region: 'us-west-2', credentials: credentials)
		bucket = Rails.application.secrets.aws_bucket
		if song.upload_url
			song = s3.bucket(bucket).object("#{song.upload_url.split('.com/')[1]}")
			song.delete	
		else 
			s3.bucket(bucket).objects({prefix:"uploads/song/song/#{song.id}"}).each do |object|
				 object.delete
			end
		end
		if song.upload_artwork_url
			artwork = s3.bucket(bucket).object("#{song.upload_artwork_url.split('.com/')[1]}")
			artwork.delete
		else
			s3.bucket(bucket).objects({prefix:"uploads/song/artwork/#{song.id}"}).each do |object|
				 object.delete
			end
		end
	end

	def self.uploadSong(song,name,s3)
		file_path = "#{Rails.root}/public/#{song.song.store_dir}/#{name}_reduced.mp3"
		artwork_path = "#{Rails.root}/public#{song.artwork.url}"
		# need to wrap it around both, as someone may be uploading while the transcoding is occuring.
		if song.artwork.url
			song.colors  = App.getColor(artwork_path)
		else
			song.colors = ["#000000","#000000"]
		end
		song.store_url = "#{song.song.store_dir}/#{name}.mp3"
		if (!song.upload_artwork_url_nsfw || song.upload_artwork_url_nsfw === "") && song.artwork.url
			if App.nsfwCheck(artwork_path)
				nsfw = true
				puts 'product nsfw'
				photo_path_nsfw = App.nsfwImage(artwork_path)
				upload_nsfw = s3.bucket(bucket).object(photo_path_nsfw.split('waydope/public/')[1])
				
			# Upload it      
				upload_nsfw.upload_file(photo_path_nsfw)
			end
		end

		bucket = Rails.application.secrets.aws_bucket
			
		# Create the object to upload
		#have to remove the first slash as it will create an empty folder in aws.
		file = s3.bucket(bucket).object("#{song.song.store_dir}/#{name}_reduced.mp3")
		file.upload_file(file_path)
		time = Time.now.strftime("%S%M%HT%d%m%Y")

		if song.artwork.url
			if !song.upload_artwork_url 
				 artwork = s3.bucket(bucket).object("#{song.artwork.store_dir}/#{name}_artwork_#{time}.png") 
			end
			# Upload it
				
			if !song.upload_artwork_url 
				 artwork = s3.bucket(bucket).object("#{song.artwork.store_dir}/#{name}_artwork_#{time}.png") 
			end
			if !song.upload_artwork_url && artwork && artwork_path 
				 artwork.upload_file(artwork_path) 
			end
		end
		# Save it
		if Rails.env.production?
			song.upload_url = "https://#{Rails.application.secrets.cdn}.waydope.com/#{song.song.store_dir}/#{name}_reduced.mp3"
			if song.artwork.url
				if !song.upload_artwork_url 
					 song.upload_artwork_url = "https://#{Rails.application.secrets.cdn}.waydope.com/#{song.artwork.store_dir}/#{name}_artwork_#{time}.png" 
				end
				if nsfw && ( !song.upload_artwork_url_nsfw  || song.upload_artwork_url_nsfw === "")
					address = upload_nsfw.public_url.to_s.split('.com')[1]
					song.upload_artwork_url_nsfw = "https://#{Rails.application.secrets.cdn}.waydope.com#{address}"
				end
			end
		else
			song.upload_url = file.public_url.to_s
			if song.artwork.url
				if !song.upload_artwork_url 
					 song.upload_artwork_url = artwork.public_url.to_s 
				end
				if nsfw && ( !song.upload_artwork_url_nsfw  || song.upload_artwork_url_nsfw === "") 
					 song.upload_artwork_url_nsfw = upload_nsfw.public_url.to_s  
				end
			end
		end
		song.upload_artwork_url ||= ''
		song.upload_artwork_url_nsfw ||= ''
		song.worked = true
		song.save
	end

	def self.findUrl(song,title)
		if !title || title != song.title || !song.url
			if !Song.exists?(url: song.og_url_name, main_genre: song.main_genre)
				return song.og_url_name
			elsif !Song.exists?(url: "#{song.artist.parameterize.gsub('_','-')}-#{song.og_url_name}", main_genre: song.main_genre)
				return "#{song.artist.parameterize.gsub('_','-')}-#{song.og_url_name}"
			elsif !Song.exists?(url: "#{song.og_url_name}-#{song.artist.parameterize.gsub('_','-')}", main_genre: song.main_genre)
				return "#{song.og_url_name}-#{song.artist.parameterize.gsub('_','-')}"
			elsif !Song.exists?(url: "#{song.og_url_name}-#{Time.now.strftime('%m%d%Y')}")
				return "#{song.og_url_name}-#{Time.now.strftime('%m%d%Y')}"
			elsif !Song.exists?(url: "#{song.og_url_name}-#{Time.now.strftime('%H%MT%m%d%Y')}")
				return "#{song.og_url_name}-#{Time.now.strftime('%H%MT%m%d%Y')}"
			else
				#this will most likely never result in a collision, and if it does, it was purposeful, and they'll just receive the first one.
				return "#{song.og_url_name}-#{Time.now.strftime('%H%M%ST%m%d%Y')}"
			end
		  else
			return song.url
		  end
	end

	def self.uploadPhoto(song,s3)
		bucket = Rails.application.secrets.aws_bucket
		photo_path = "#{Rails.root}/public#{song.artwork.url}"

		song.colors = App.getColor(photo_path)

		if App.nsfwCheck(photo_path)
			song.nsfw = true
			puts App.nsfwImage(photo_path)
			photo_path_nsfw = App.nsfwImage(photo_path)
			upload_nsfw = s3.bucket(bucket).object(photo_path_nsfw.split('waydope/public/')[1])
		
			# Upload it      
			upload_nsfw.upload_file(photo_path_nsfw)
		else
			song.nsfw = false
		end
		old_photo_url = song.upload_artwork_url
		time = Time.now.strftime("%S%M%HT%d%m%Y")
		if old_photo_url != ''
			old_photo = s3.bucket(bucket).object("#{song.upload_artwork_url.split('.com/')[1]}")
			old_photo.delete
		end
		upload = s3.bucket(bucket).object("#{song.artwork.store_dir}/#{name}_artwork_#{time}.png")
		upload.upload_file(photo_path)
		if Rails.env.production? 
			song.upload_artwork_url = "https://#{Rails.application.secrets.cdn}.waydope.com/#{song.artwork.store_dir}/#{name}_artwork_#{time}.png"
			if song.nsfw 
				address = upload_nsfw.public_url.to_s.split('.com')[1]
				song.upload_artwork_url_nsfw = "https://#{Rails.application.secrets.cdn}.waydope.com#{address}"
			else
				song.upload_artwork_url_nsfw = ""
			end
		else
			song.upload_artwork_url = upload.public_url.to_s
			if song.nsfw 
				song.upload_artwork_url_nsfw = upload_nsfw.public_url.to_s
			else
				song.upload_artwork_url_nsfw = ""
			end
		end
		song.save
	end

	def self.getColor(image)
       colors = %x[convert #{image}: -quantize transparent -colors 1 -unique-colors txt:-]
    end

	def self.purge_cache
		$redis = Redis::Namespace.new("way_dope", :redis => Redis.new)
		if $redis.exists("music_all_keys")
			$redis.lrange("music_all_keys",0,-1).each do |key|
				$redis.del(key)
			end
			$redis.del("music_all_keys")
		end
		if $redis.exists("music_menu_total") && $redis.get("music_menu_total").to_i < 15
			$redis.lrange("music_menu_keys",0,-1).each do |key|
				$redis.del(key)
			end
			$redis.del("music_menu_keys")
		end
		if $redis.exists("home_music_total") && $redis.get("home_music_total").to_i < 15
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
