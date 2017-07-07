require 'fuzzystringmatch'
class Api::V1::Videos::VideosController < ApplicationController
	include ActionView::Helpers::DateHelper
	def index
		offset = request.headers["offset"].to_i % 1 === 0 && request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i : 0 # not a terrible sanitation honestly.
		sanitizedTime = Song.sanitizeTime(request.headers["time"].to_s)
		time = sanitizedTime ? sanitizedTime : 10.years.ago
		sanitizedOrder = Song.sanitizeOrder(request.headers["order"].to_s,request.headers["type"].to_s)
		order = sanitizedOrder ? sanitizedOrder : "vc.count DESC, vc.created_at DESC"
			#
			#for some weird reason you can't do the '?' in the order and have to do #{} instead. throws some no constant error. No idea.
			#

		puts request.headers["vorder"]
		video_offset = request.headers["voffset"].to_i % 1 === 0 && request.headers["voffset"].to_i > 0 ? request.headers["voffset"].to_i : 0
		sanitizedTime = Song.sanitizeTime(request.headers["vtime"].to_s)
		video_time = sanitizedTime ? sanitizedTime : 10.years.ago
		sanitizedOrder = Song.sanitizeOrder(request.headers["vorder"].to_s,request.headers["vtype"].to_s)
		video_order = sanitizedOrder ? sanitizedOrder : "hotness DESC, v.average_vote DESC, v.created_at DESC"

		categories = $redis.get("videos_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_categories")
		if categories.nil?
			sanitized_query = VideoCategory.escape_sql(["SELECT count(*) OVER () AS total_count, vc.* FROM video_categories vc WHERE created_at >= ? GROUP BY vc.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset]) 
			categories = VideoCategory.find_by_sql(sanitized_query).to_json
			$redis.set("videos_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_categories",categories)
			$redis.rpush("videos_all_keys","videos_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_categories")
		end
		categories = JSON.parse(categories)

		all_videos = $redis.get("videos_all_#{video_offset}_#{video_time.strftime("%F")}_#{video_order.parameterize}_all")
		if all_videos.nil?
			sanitized_query = Video.escape_sql(["SELECT count(*) OVER () AS total_count, v.* FROM videos v WHERE created_at >= ? AND worked = true AND uploaded = true AND flagged = false AND removed = false GROUP BY v.id ORDER BY #{video_order} OFFSET ? LIMIT 20", video_time.to_s,video_offset]) 
			all_videos = Video.find_by_sql(sanitized_query).to_json
			$redis.set("videos_all_#{video_offset}_#{video_time.strftime("%F")}_#{video_order.parameterize}_all",all_videos)
			$redis.rpush("videos_all_keys","videos_all_#{video_offset}_#{video_time.strftime("%F")}_#{video_order.parameterize}_all")
		end
		all_videos = JSON.parse(all_videos)
		
		Video.userCheck([all_videos], request.headers["Authorization"])
		
		page = offset > 0 ? offset / 20 : 1
		count = categories && categories.first ? categories.first["total_count"] : 0
		pages = (count / 20.0).ceil

		video_page = video_offset > 0 ? video_offset / 20 : 1
		video_count = all_videos && all_videos.first ? all_videos.first["total_count"] : 1
		video_pages = (video_count / 20.0).ceil
		
		if categories != []
			# puts categories
			# puts categories[0]
			postIds = []
			firsttd = categories[0]  && categories[0]['top_day'].length != 0 ? categories[0]['top_day'] : []
			secondtd = categories[1] && categories[1]['top_day'].length != 0 ? categories[1]['top_day'] : []
			thirdtd = categories[2] && categories[2]['top_day'].length != 0 ? categories[2]['top_day'] : []
			fourthtd = categories[3] && categories[3]['top_day'].length != 0 ? categories[3]['top_day'] : []
			postIds.concat(firsttd).concat(secondtd).concat(thirdtd).concat(fourthtd)
			postIds.to_json
			fl = firsttd.length != 0 ? firsttd.length : 0
			sl = secondtd.length != 0 ? secondtd.length + fl : 0 + fl
			tl = thirdtd.length != 0 ? thirdtd.length + sl : 0 + sl
			fol = fourthtd.length != 0 ? fourthtd.length + tl : 0 + tl
			if postIds && postIds.length
				puts postIds.length
				puts postIds
				posts = $redis.get("videos_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_all_posts")
				puts posts
				if posts.nil?
					records = Video.where(uuid: (postIds.split(',').to_a)).select_with(App.getGoodColumns('videos')).group_by(&:uuid)
					posts = records && records.length && postIds.length ? postIds.map{|id| records[id].first}.to_json : []
					$redis.set("videos_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_all_posts",posts)
					$redis.rpush("videos_all_keys","videos_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_all_posts")
				end
				posts = JSON.parse(posts)
				Video.userCheck([posts.to_a], request.headers["Authorization"])
				sortedposts = []
				# sortedposts << posts[posts[0...fl].to_a, posts[fl...sl].to_a, posts[tl...fol].to_a, [fol...posts.length].to_a]
				sortedposts << posts[0...fl].to_a
				sortedposts << posts[fl...sl].to_a
				sortedposts << posts[sl...tl].to_a
				sortedposts << posts[tl...fol].to_a
				# render json:{genres:genres, first:posts[0...fl], second:posts[fl...sl],third:posts[tl...fol],fourth:[fol...posts.length]}, status: :ok
				ids = all_videos.map{|video|video["uuid"]}
				render json:{categories:categories, videos:sortedposts, page:page, offset: 0, count:count, pages:pages, all:all_videos, video_count:video_count, video_pages:video_pages, video_page: video_page, ids:ids}, status: :ok
			else 
				render json:{categories:categories, videos:[], page:page, offset: 0, count:count, pages:pages, all:all_videos, video_count:video_count, video_pages:video_pages, video_page: video_page}, status: :ok
			end
		else
			render json: {}, status: :not_found
		end
	end

	def read
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
		if user && user.admin
			video = Video.where('url = ? AND main_category = ? AND flagged = false AND removed = false', params["video"], params["category"]).first
		else
			video = Video.where('url = ? AND main_category = ? AND flagged = false AND removed = false', params["video"], params["category"]).select_with(App.getGoodColumns('videos',false,false,true)).first
		end
		if video
			if !video.removed
				if user
					video.user_liked = video.likes.key?(user.uuid) ? true : false
					video.user_voted = video.votes.key?(user.uuid) ? video.votes[user.uuid] : nil
					video.user_reported = video.report_users.include?(user.uuid) ? true : false
					video.user_rated = video.ratings.key?(user.uuid) ? true : false
					video.votes = nil
					video.ratings = nil
					video.likes = nil
					video.report_users = nil
				end
				video.time_ago = time_ago_in_words(video.created_at) + ' ago'
				render json: {video:video}, status: :ok
				user_id = user ? user.id : nil
				ViewcountWorker.perform_async(video.uuid,user_id,'videos',request.remote_ip)
			else
				render json:{}, status: :gone
			end
		else
			render json: {}, status: :not_found
		end
	end

	def create
		if(params[:post_type] === 1 &&  (!params[:file] || !Video.sanitizeUpload(params[:file].content_type)))
			render json:{status: 415, success:false, message:'unsupported media type'}
			return false
		end
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
			video = Video.new
			video.main_category = params[:main_category] ? params[:main_category].parameterize : "temp-storage-category"
			video.main_category_display = params[:main_category] ? params[:main_category].titleize : "temp-storage-category"
			video.categories = params[:categories] ? params[:categories].map(&:parameterize) : ["temp-storage-category"]
			video.og_url_name = params[:title] ? params[:title].parameterize.gsub("_","-") : "temp-#{time}"
			video.submitted_by = user.username
			if params[:title]
				video.url = Video.findUrl(video,params[:title])
			else
				video.url = video.og_url_name
			end
			video.title = params[:title] ? params[:title] : "temp-#{time}"
			video.description = params[:description] ? params[:description] : '' ## kept the same so it shows the marked text when the video is edited
			video.stripped = params[:marked] ? ActionView::Base.full_sanitizer.sanitize(params[:marked]) : '' ## remove all html tags
			video.marked = params[:marked] ? ActionController::Base.helpers.sanitize(params[:marked]) : ''	## remove scripts and on* javascript
			video.user_id = user.id
			video.likes_count = 1
			video.likes = {user.uuid => true}
			video.votes = {user.uuid => 1}
			video.average_vote = 1
			video.votes_count = 1
			video.upvotes = 1
			video.uuid = Video.setUUID
			video.flagged = false
			video.removed = false
			if params[:post_type].to_i == 1
				# file = params[:file] ? params[:file] : params[:video]
				# video.video = file
				video.link = 'na'
				video.form = 1
			elsif params[:post_type].to_i == 0
				video.original_link = params[:link]
				video.link = params[:link]
				video.form = 0
				video.link_type = Video.sanitizeLink(params[:link])
				video.uploaded = true
			else
				render json:{message:'need post_type parameter'}, status: :bad_request
				return false
			end
			if params[:post_type] === 0 && video.link_type === 0
				render json: {error:true, message:'unsupported media type'}, status: :unsupported_media_type
				return false
			end
			if video.save
				if video.form === 0
					render json: {id: video.uuid, url:video.url}, status: :created
				else 
					@store = video.video.store_dir
					string_to_sign
					render :json => {
						:policy => @policy,
						:signature => sig,
						:key => Rails.application.secrets.aws_access_key_id,
						:success=>true,
						:store=> @store,
						:time => @time_policy,
						:time_date => @date_stamp,
						:video_id => video.uuid,
						:category => video.category,
						:url => video.url
					}
				end

				user_videos_hash = user.videos
				user_videos_hash[video.uuid] = true
				user.videos = user_videos_hash
				if user.videos_votes 
					votes_hash = user.videos_votes
					votes_hash[video.uuid] = 1
					user.videos_votes = votes_hash
				else
					user.videos_votes = {user.videos_votes => 1}
				end
				user.average_vote = ((user.average_vote * user.votes_count) + 1)/(user.votes_count + 1)
				user.votes_count += 1
				user.save!
				if video.form === 0
					VideoembedWorker.perform_async
					VideocategorizeWorker.perform_async
				elsif video.form === 1
					#VideouploadWorker.perform_async
				end
			else
				render json: {}, status: :internal_server_error
				Rails.logger.info(video.errors.inspect) 
			end
		else
			render json: {}, status: :unauthorized
		end
	end

	def update
		if request.headers["Authorization"]
			auth = request.headers["Authorization"]
		elsif params[:authorization]
			auth = params[:authorization]
		else
			render json: {}, status: :unauthorized
			return false
		end
		user = User.find_by_token(auth.split(' ').last)
		if user 
			video = Video.where("category = ? AND url = ?",params[:main_category], params[:video]).first
			if video 
				if params[:photo_upload]
					video.artwork = params[:file]
					if video.save
						render json:{}, status: :internal_server_error
						VideophotoWorker.perform_async(video.uuid)
						return true
					else
						render json:{}, status: :bad_request
						Rails.logger.info(video.errors.inspect) 
						return false
					end
				end

				if params[:edit]
					if params[:title] && params[:title] != video.title
						if (Time.now - video.created_at) > (5*60)
							render json:{title:false, time:true, change:true, message:"title can't be changed after the first five minutes"}, status: :bad_request
							return false
						elsif video.title_change && video.title_change > 0
							render json:{title:false, time:false, change:true, message:"title can only be edited once"}, status: :bad_request
							return false
						elsif FuzzyStringMatch::JaroWinkler.create( :native ).getDistance(video.title, params[:title]) < 0.92
							render json:{title:true, time:false, change:false, message:"title has been altered too much"}, status: :bad_request
							return false
						else
							video.title = params[:title]
							video.title_change = 1
						end
					end
					if params[:link] && params[:link] != video.original_link
						render json:{link:true,message:"link can't be edited after submission'"}, status: :bad_request
						return false
					end
					video.old_category = params[:main_category] != video.main_category ? video.main_category : nil
					video.main_category = params[:main_category] ? params[:main_category].parameterize : video.main_category
					video.main_category_display = params[:main_category] ? params[:main_category].titleize : video.main_category_display
					video.categories = params[:categories] ? params[:categories].map(&:parameterize) : video.categories
					if params[:title] && params[:title].parameterize != video.og_url_name
						video.og_url_name = params[:title] ? params[:title].parameterize.gsub("_","-") : video.og_url_name
						video.url = Video.findUrl(video,params[:title])
					end
					video.title = params[:title] ? params[:title] : video.title
					puts params[:description]
					video.description = params[:description] ? params[:description] : video.description ## kept the same so it shows the marked text when the video is edited
					video.stripped = params[:marked] ? ActionView::Base.full_sanitizer.sanitize(params[:marked]) : video.stripped ## remove all html tags
					video.marked = params[:marked] ? ActionController::Base.helpers.sanitize(params[:marked]) : video.marked	## remove scripts and on* javascript
					video.categorized = false
					if video.save
						render json:{url:video.url}, status: :ok
						VideocategorizeWorker.perform_async
						if video.worked then PurgecacheWorker.perform_async(video.post_type,video.uuid) end
						return true
					else
						render json:{}, status: :internal_server_error
						Rails.logger.info(video.errors.inspect)
						return false 
					end
				end

				video.og_url_name = params[:title].parameterize.gsub("_","-") ? params[:title].parameterize.gsub("_","-") : video.og_url_name
				video.main_category = params[:main_category] ? params[:main_category].parameterize : video.main_category
				video.main_category_display = params[:main_category] ? params[:main_category].titleize : video.main_category_display
				video.categories = params[:categories] ? params[:categories].map(&:parameterize) : video.categories
				video.url = Video.findUrl(video,params[:title])
				video.title = params[:title] ? params[:title] : video.title
				video.uploaded = true
				if video.form then video.link = params[:key] end
				video.description = params[:description] ? params[:description] : nil
				if video.save
					render json:{url:video.url}, status: :ok
					if video.form
						VideouploadWorker.perform_async
					end
					VideocategorizeWorker.perform_async
				else
					render json:{}, status: :internal_server_error
					Rails.logger.info(video.errors.inspect) 
				end
			else
				render json:{id:params[:video]}, status: :not_found
			end
		else
			render json:{}, status: :unauthorized
		end
	end

	def delete
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
		if user 
			video = Video.where("genre = ? AND url = ?",params[:main_category],params[:video]).first

				if !video
					render json: {}, status: :not_found
					return false
				end

				if video.user_id != user.id
					render json: {}, status: :unauthorized
					return false
				end
				
				if video && video.comment_count < 1
					video.in_deletion = true
					video.deleted = true
					if video.save
						render json: {}, status: :ok
						VideodeleteWorker.perform_async
					else
						render json: {}, status: :internal_server_error
					end
				end

				if video && video.comment_count >= 1
					video.in_deletion = true
					video.hidden = true
					video.deleted_submitted_by = video.submitted_by
					video.deleted_description = video.description
					video.deleted_user_id = video.user_id
					video.submitted_by = '[Deleted]'
					video.user_id = 0		
					if video.save
						render json:{status:204, success:true, hidden:video.hidden}
						VideodeleteWorker.perform_async
					else
						render json:{}, status: :internal_server_error
					end
				end
		else
			render json: {}, status: :unauthorized
		end
	end
	
	private

	def string_to_sign
		
		@time = Time.now.utc
		@time_policy = @time.strftime('%Y%m%dT000000Z')
		@date_stamp = @time.strftime('%Y%m%d')

		 ret = {"expiration" => 10.hours.from_now.utc.iso8601,
				"conditions" =>  [
					{"bucket" => Rails.application.secrets.aws_bucket},
					{"x-amz-credential": "#{Rails.application.secrets.aws_access_key_id}/#{@date_stamp}/us-west-2/s3/aws4_request"},
					{"x-amz-algorithm": "AWS4-HMAC-SHA256"},
					{"x-amz-date": @time_policy },
					["starts-with", "$key", "uploads"],
					["content-length-range", 0, 2147483648]
				]
			}

		@policy = Base64.encode64(ret.to_json).gsub(/\n|\r/, '')

	end

	def getSignatureKey
		kDate = OpenSSL::HMAC.digest('sha256', ("AWS4" +  Rails.application.secrets.aws_secret_access_key), @date_stamp)
		kRegion = OpenSSL::HMAC.digest('sha256', kDate, 'us-west-2')
		kService = OpenSSL::HMAC.digest('sha256', kRegion, 's3')
		kSigning = OpenSSL::HMAC.digest('sha256', kService, "aws4_request")
	end

	def sig
		# sig = Base64.encode64(OpenSSL::HMAC.digest('sha256', getSignatureKey,  @policy)).gsub(/\n|\r/, '')
		sig = OpenSSL::HMAC.hexdigest(OpenSSL::Digest.new('sha256'), getSignatureKey, @policy).gsub(/\n|\r/, '')
	end
end
