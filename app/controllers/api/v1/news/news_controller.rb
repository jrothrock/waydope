require 'fuzzystringmatch'
include ActionView::Helpers::DateHelper
class Api::V1::News::NewsController < ApplicationController
	def index
		offset = request.headers["offset"].to_i % 20 === 0 && request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i : 0 # not a terrible sanitation honestly.
		sanitizedTime = Song.sanitizeTime(request.headers["time"].to_s)
		time = sanitizedTime ? sanitizedTime : 10.years.ago
		sanitizedOrder = Song.sanitizeOrder(request.headers["order"].to_s,request.headers["type"].to_s)
		order = sanitizedOrder ? sanitizedOrder : "bc.count DESC, bc.created_at DESC"

		news_offset = request.headers["noffset"].to_i % 20 === 0 && request.headers["noffset"].to_i > 0 ? request.headers["noffset"].to_i : 0
		sanitizedTime = Song.sanitizeTime(request.headers["ntime"].to_s)
		news_time = sanitizedTime ? sanitizedTime : 10.years.ago
		sanitizedOrder = Song.sanitizeOrder(request.headers["norder"].to_s,request.headers["ntype"].to_s)
		news_order = sanitizedOrder ? sanitizedOrder : "n.hotness DESC, n.average_vote, n.created_at DESC"

			#
			#for some weird reason you can't do the '?' in the order and have to do #{} instead. throws some no constant error.
			#
		#
		# try to combine the queries so that it only has to do one call to get the count, the board_categories, and the posts 
		# So, active record keeps a single persistant db connection, but the count is still faster using the above compared to two calls like the all_posts.
		#
		# sanitized_query = BoardCategory.escape_sql(["SELECT count(*) OVER () AS total_count, bc.*, ap.* FROM (SELECT * FROM board_categories WHERE created_at >= ? GROUP BY id ORDER BY #{order} OFFSET ? LIMIT 20) as bc, (SELECT * FROM news_posts ORDER BY average_vote DESC LIMIT 1) as ap", time.to_s,offset])  
		boards = $redis.get("news_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_categories")
		if boards.nil?
			sanitized_query = BoardCategory.escape_sql(["SELECT count(*) OVER () AS total_count, bc.* FROM board_categories bc WHERE created_at >= ? GROUP BY bc.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
			boards = BoardCategory.find_by_sql(sanitized_query).to_json
			$redis.set("news_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_categories",boards)
			$redis.rpush("news_all_keys", "news_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_categories")
		end
		boards = JSON.parse(boards)

		puts "news_all_#{news_offset}_#{news_time.strftime("%F")}_#{order.parameterize}_all"
		all_posts = $redis.get("news_all_#{news_offset}_#{news_time.strftime("%F")}_#{news_order.parameterize}_all")
		if all_posts.nil?
			sanitized_query = NewsPost.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('news',true,'n')} FROM news_posts n WHERE created_at >= ? AND worked = true AND flagged = false AND removed = false GROUP BY n.id ORDER BY #{news_order} OFFSET ? LIMIT 20", news_time.to_s,news_offset]) 
			all_posts = NewsPost.find_by_sql(sanitized_query).to_json
			$redis.set("news_all_#{news_offset}_#{news_time.strftime("%F")}_#{news_order.parameterize}_all",all_posts)
			$redis.rpush("news_all_keys", "news_all_#{news_offset}_#{news_time.strftime("%F")}_#{news_order.parameterize}_all")
		end
		all_posts = JSON.parse(all_posts)

		NewsPost.userCheck([all_posts.to_a], request.headers["Authorization"])
		
		page = offset > 0 ? offset / 20 : 1
		count = boards && boards.first ? boards.first["total_count"] : 0
		pages = (count / 20.0).ceil
	
		news_page = news_offset > 0 ? news_offset / 20 : 1
		news_count = all_posts && all_posts.first ? all_posts.first["total_count"] : 0
		news_pages = (news_count / 20.0).ceil

		if boards != []
			puts boards
			puts boards[0]
			postIds = []
			firsttd = boards[0]  && boards[0]['top_day'].length != 0 ? boards[0]['top_day'] : []
			secondtd = boards[1] && boards[1]['top_day'].length != 0 ? boards[1]['top_day'] : []
			thirdtd = boards[2] && boards[2]['top_day'].length != 0 ? boards[2]['top_day'] : []
			fourthtd = boards[3] && boards[3]['top_day'].length != 0 ? boards[3]['top_day'] : []
			postIds.concat(firsttd).concat(secondtd).concat(thirdtd).concat(fourthtd)
			postIds
			fl = firsttd.length != 0 ? firsttd.length : 0
			sl = secondtd.length != 0 ? secondtd.length + fl : 0 + fl
			tl = thirdtd.length != 0 ? thirdtd.length + sl : 0 + sl
			fol = fourthtd.length != 0 ? fourthtd.length + tl : 0 + tl
			puts postIds
			if postIds != []
				puts postIds
				posts = $redis.get("news_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_all_posts")
				if posts.nil?
					records = NewsPost.where(uuid: (postIds.split(',').to_a)).select_with(App.getGoodColumns('news')).group_by(&:uuid)
					posts = records ? postIds.map{|id| records[id].first}.to_json : []
					$redis.set("news_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_all_posts",posts)
					$redis.rpush("news_all_keys", "news_all_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_all_posts")
				end
				posts = JSON.parse(posts)
				NewsPost.userCheck([posts.to_a], request.headers["Authorization"])
				sortedposts = []
				# sortedposts << posts[posts[0...fl].to_a, posts[fl...sl].to_a, posts[tl...fol].to_a, [fol...posts.length].to_a]
				sortedposts << posts[0...fl].to_a
				sortedposts << posts[fl...sl].to_a
				sortedposts << posts[sl...tl].to_a
				sortedposts << posts[tl...fol].to_a


				# render json:{status:200, success:true, boards:boards, first:posts[0...fl], second:posts[fl...sl],third:posts[tl...fol],fourth:[fol...posts.length]}
				# render json:{status:200, success:true, boards:boards, posts:sortedposts, page:page, offset: 0, count:count, pages:pages,all:all_posts}
				render json:{status:200, success:true, boards:boards, posts:sortedposts, page:page, offset: offset, count:count, pages:pages, all:all_posts, news_count:news_count, news_pages:news_pages, news_page: news_page}
			else 
				render json:{status:200, success:true, boards:boards, posts:[], page:page, offset: offset, count:count, pages:pages, all:all_posts, news_count:news_count, news_pages:news_pages, news_page: news_page}
			end
		else
			render json: {status:404,success:false}
		end
	end

	def read
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
		if user && user.admin
			post = NewsPost.where('url = ? AND main_category = ?', request.headers["id"], request.headers["category"]).first
		else
			post = NewsPost.where('url = ? AND main_category = ?', request.headers["id"], request.headers["category"]).select_with(App.getGoodColumns('news',false,nil,true)).first
		end
		if post
			if !post.removed
				if user 
					post.user_voted = post.votes.key?(user.uuid) ? post.votes[user.uuid] : nil
					post.user_reported = post.report_users.include?(user.uuid) ? true : false
					post.user_rated = post.ratings.include?(user.uuid) ? true : false
				end
				post.time_ago = time_ago_in_words(post.created_at) + ' ago'
				post.report_users = nil
				post.ratings = nil
				post.votes = nil
				render json: {status:200, success:true, post:post}
				user_id = user ? user.id : nil
				ViewcountWorker.perform_async(post.uuid,user_id,'news',request.remote_ip)
			else
				render json:{status:410, success:false}
			end
		else
			render json: {status:404, success:false}
		end
	end
		
	def create
		Rails.logger.info(params.inspect) 
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
		if user 
			post = NewsPost.new
			post.main_category = params[:main_category] ? params[:main_category].parameterize : 'temp'
			post.main_category_display = params[:main_category] ? params[:main_category].titleize : 'temp'
			post.categories = params[:categories].map(&:parameterize) ? params[:categories].map(&:parameterize) : ['temp']
			if params[:post_type].to_i == 1
				sanitize_link = NewsPost.sanitize(params[:link])
				puts sanitize_link
				post.link = sanitize_link[0]
				post.nsfw = sanitize_link[1]
				post.flagged = sanitize_link[2]
				if post.flagged then post.flag_created = Time.now end
				post.hostname =  URI.parse(post.link).host
				post.secure_link = URI.parse(post.link).scheme === 'https' ? true : false
				teaser = NewsPost.getTeaser(post.link)
				if(teaser == false)
					render json:{status:415, success:false, message:"link is invalid"}
					return false
				end
				post.teaser = teaser
				post.form = 1
			elsif params[:post_type].to_i == 0
				post.hostname = 'waydope.com'
				post.link = 'na'
				post.form = 0
				post.teaser = NewsPost.teaserDescription(ActionView::Base.full_sanitizer.sanitize(params[:marked]))
				post.description = params[:description] ? params[:description] : '' ## kept the same so it shows the marked text when the post is edited
				post.stripped = params[:marked] ? ActionView::Base.full_sanitizer.sanitize(params[:marked]) : '' ## remove all html tags
				post.marked = params[:marked] ? ActionController::Base.helpers.sanitize(params[:marked]) : ''	## remove scripts and on* javascript
			end
			puts post.link
			if !post.link || post.link === 'f' || post.link === 't'   
				render json: {status:415,success:false, error:true, message:'unsupported media type'}
				return false
			end
			post.user_id = user.id
			post.uuid = NewsPost.setUUID
			post.average_vote = 1
			post.votes = {user.uuid => 1}
			post.upvotes = 1
			post.votes_count = 1
			post.og_url_name = params[:title].parameterize ? params[:title].parameterize : 'temp'
			post.url = NewsPost.findUrl(post,params[:title])
			post.title = params[:title] ? params[:title] : 'temp'
			puts params[:title]
			puts post.url
			post.worked = true
			post.removed = false
			post.submitted_by = user.username
			if post.save
				render json: {status:201, success:true, url:post.url}

				user_news_hash = user.news_posts
				user_news_hash[post.uuid] = true
				user.news_posts = user_news_hash

				user.average_vote = ((user.average_vote * user.votes_count) + 1)/(user.votes_count + 1)
				user.votes_count += 1
				if user.news_votes
					votes_hash = user.news_votes
					votes_hash[post.uuid] = 1
					user.news_votes = votes_hash
				else
					user.news_votes = {post.uuid => 1}
				end
				user.save!
				PostcategorizeWorker.perform_async
			else
				render json: {status:500, success:false}
				Rails.logger.info(post.errors.inspect) 
			end
		else
			render json: {status:401, success:false}
		end
	end

	def update
	### this uses both request headers and params due to jQuerys file upload. Maybe able to set headers in jQuerys file upload though, just haven't really looked.
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
			post = params[:post] ? NewsPost.where("uuid = ?", params[:post]).first : nil
			if post 
				if params[:title] != post.title
					if (Time.now - post.created_at) > (5*60)
						render json:{status: 400, success:false, title:false, time:true, change:true, message:"title can't be changed after the first five minutes"}
						return false
					elsif post.title_change && post.title_change > 0
						render json:{status: 400, success:false, title:false, time:false, change:true, message:"title can only be edited once"}
						return false
					elsif FuzzyStringMatch::JaroWinkler.create( :native ).getDistance(post.title, params[:title]) < 0.92
						render json:{status: 400, success:false, title:true, time:false, change:false, message:"title has been altered too much"}
						return false
					else
						post.title = params[:title]
						post.title_change = 1
					end
				end
				post.old_category = params[:main_category] != post.main_category ? post.main_category : nil
				post.main_category = params[:main_category] ? params[:main_category].parameterize : post.main_category
				post.main_category_display = params[:main_category] ? params[:main_category].titleize : post.main_category_display
				post.categories = params[:categories] ? params[:categories].map(&:parameterize) : post.categories
				if params[:title] && params[:title].parameterize != post.og_url_name
					post.og_url_name = params[:title] ? params[:title].parameterize : post.og_url_name
					post.url = NewsPost.findUrl(post,params[:title])
				end
				post.title = params[:title] ? params[:title] : post.title
				post.description = params[:description] != nil ? params[:description] : nil ## kept the same so it shows the marked text when the post is edited
				post.stripped = params[:marked] != nil ? ActionView::Base.full_sanitizer.sanitize(params[:marked]) : '' ## remove all html tags
				post.marked = params[:marked] != nil ? ActionController::Base.helpers.sanitize(params[:marked]) : ''	## remove scripts and on* javascript
				post.categorized = false

				## tough one with the description. If people delete description then it may send in null -
				if post.save
					render json:{status:200, success:true, url:post.url}
					PostcategorizeWorker.perform_async
					PurgecacheWorker.perform_async(post.post_type,post.uuid)
					return true
				else
					render json:{status:500, success:false}
					Rails.logger.info(post.errors.inspect)
					return false 
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
			post = params[:post] ? NewsPost.where("uuid = ?",params[:post]).first : nil
			
			if !post
					render json: {status: 404, success:false}
					return false
			end

			if post.user_id != user.id
				render json: {status: 401, success:false}
				return false
			end

			if post && post.comment_count < 1
				post.in_deletion = true
				post.deleted = true
				if post.save
					render json: {status:204, success:true}
					PostdeleteWorker.perform_async
				else
					render json: {status:500, success:false }
					Rails.logger.info(post.errors.inspect)
				end
			end
			if post && post.comment_count >= 1
				post.deleted = true
				post.hidden = true
				post.deleted_submitted_by = post.submitted_by
				post.deleted_description = post.description
				post.deleted_user_id = post.user_id
				post.submitted_by = '[Deleted]'
				post.user_id = 0
				if post.save
					render json:{status:204, success:true, hidden:post.hidden}
					PostdeleteWorker.perform_async
				else 
					render json:{status:500, success:false}
					Rails.logger.info(post.errors.inspect) 
				end
			end
		else
			render json: {status:401, success:false}
		end
	end

end
