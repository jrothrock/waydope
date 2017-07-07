class Api::V1::Comments::CommentsController < ApplicationController

	def index
		userid = nil
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
		if user
			userid = user.uuid
		end
		if !request.headers[:id] || !request.headers[:type]
			render json:{message:"id and type params are required"}, status: :bad_request
			return false
		end
		puts request.headers["type"]
		puts request.headers["id"]
		is_mobile = App.is_mobile(request.user_agent)
		if request.headers["type"] === 'music'
			comments = $redis.get("comments_music_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}")
			if comments.nil?
				sanitized_query = ::Product.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('comments',true,'c')} FROM comments c WHERE commentable_type = 'Song' AND commentable_uuid = '#{request.headers['id']}' AND parent_uuid IS null GROUP BY c.id ORDER BY stickied DESC, average_vote DESC"]) 
				comments = Json::Builder.build(sanitized_query,userid,is_mobile).to_json
				$redis.set("comments_music_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}",comments)
				$redis.rpush("comments_music_#{request.headers['id']}_keys","comments_music_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}")
				$redis.expire("comments_music_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}",10800)
				$redis.expire("comments_music_#{request.headers['id']}_keys",10800)
			end
			comments = JSON.parse(comments)
			if userid != nil
				comments = Json::Checker.checkComments(comments["comments"],userid)
			end
			# basecomments = Comment.where("commentable_type = 'Song' AND commentable_uuid = #{request.headers['id']} AND parent_uuid IS null").all.select('average_vote')
		elsif request.headers["type"] === 'news'
			puts "comments_news_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}"
			comments = $redis.get("comments_news_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}")
			if comments.nil?
				sanitized_query = ::Product.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('comments',true,'c')} FROM comments c WHERE commentable_type = 'News_post' AND commentable_uuid = '#{request.headers['id']}' AND parent_uuid IS null GROUP BY c.id ORDER BY stickied DESC, average_vote DESC"]) 
				comments = Json::Builder.build(sanitized_query,userid,is_mobile).to_json
				$redis.set("comments_news_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}",comments)
				$redis.rpush("comments_news_#{request.headers['id']}_keys","comments_news_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}")
				$redis.expire("comments_news_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}",10800)
				$redis.expire("comments_news_#{request.headers['id']}_keys",10800)
			end
			comments = JSON.parse(comments)
			if userid != nil
				comments = Json::Checker.checkComments(comments["comments"],userid)
			end
			# basecomments = Comment.where("commentable_type = 'News_post' AND commentable_uuid = #{request.headers['id']} AND parent_uuid IS null").all.select('average_vote')
		elsif request.headers["type"] === 'videos'
			comments = $redis.get("comments_videos_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}")
			if comments.nil?
				sanitized_query = ::Product.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('comments',true,'c')} FROM comments c WHERE commentable_type = 'Video' AND commentable_uuid = '#{request.headers['id']}' AND parent_uuid IS null GROUP BY c.id ORDER BY stickied DESC, average_vote DESC"]) 
				comments = Json::Builder.build(sanitized_query,userid,is_mobile).to_json
				$redis.set("comments_videos_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}",comments)
				$redis.rpush("comments_videos_#{request.headers['id']}_keys","comments_videos_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}")
				$redis.expire("comments_videos_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}",10800)
				$redis.expire("comments_videos_#{request.headers['id']}_keys",10800)
			end
			comments = JSON.parse(comments)
			if userid != nil
				comments = Json::Checker.checkComments(comments["comments"],userid)
			end
			# basecomments = Comment.where("commentable_type = 'Video' AND commentable_uuid = #{request.headers['id']} AND parent_uuid IS null").all.select('average_vote')
		elsif request.headers["type"] === 'apparel'
			comments = $redis.get("comments_apparel_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}")
			if comments.nil?
				sanitized_query = ::Product.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('comments',true,'c')} FROM comments c WHERE commentable_type = 'Apparel' AND commentable_uuid = '#{request.headers['id']}' AND parent_uuid IS null GROUP BY c.id ORDER BY stickied DESC, average_vote DESC"]) 
				comments = Json::Builder.build(sanitized_query,userid,is_mobile).to_json
				$redis.set("comments_apparel_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}",comments)
				$redis.rpush("comments_apparel_#{request.headers['id']}_keys","comments_apparel_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}")
				$redis.expire("comments_apparel_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}",10800)
				$redis.expire("comments_apparel_#{request.headers['id']}_keys",10800)
			end
			comments = JSON.parse(comments)
			if userid != nil
				comments = Json::Checker.checkComments(comments["comments"],userid)
			end
			# basecomments = Comment.where("commentable_type = 'Apparel' AND commentable_uuid = #{request.headers['id']} AND parent_uuid IS null").all.select('average_vote')
		elsif request.headers["type"] === 'technology'
			comments = $redis.get("comments_technology_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}")
			if comments.nil?
				sanitized_query = ::Product.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('comments',true,'c')} FROM comments c WHERE commentable_type = 'Technology' AND commentable_uuid = '#{request.headers['id']}' AND parent_uuid IS null GROUP BY c.id ORDER BY stickied DESC, average_vote DESC"]) 
				comments = Json::Builder.build(sanitized_query,userid,is_mobile).to_json
				$redis.set("comments_technology_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}",comments)
				$redis.rpush("comments_technology_#{request.headers['id']}_keys","comments_technology_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}")
				$redis.expire("comments_technology_#{request.headers['id']}#{is_mobile ? '_mobile' : ''}",10800)
				$redis.expire("comments_technology_#{request.headers['id']}_keys",10800)
			end
			comments = JSON.parse(comments)
			if userid != nil
				comments = Json::Checker.checkComments(comments["comments"],userid)
			end
			# basecomments = Comment.where("commentable_type = 'Technology' AND commentable_uuid = #{request.headers['id']} AND parent_uuid IS null").all.select('average_vote')
		end
		# puts basecomments
		# base = basecomments.to_a.index(basecomments.min_by{|x| x.average_vote - 0})
		base = 0
		puts base
		if comments
			render json: {comments:comments,base:base}, status: :ok
		else
			render json: {}, status: :not_found
		end
	end

	def read
		if request.headers["id"]
			user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
			userid = user && user.uuid ? user.uuid : nil
			is_mobile = App.is_mobile(request.user_agent)
			sanitized_query = ::Comment.escape_sql(["SELECT #{App.getGoodColumns('comments',true,'c')} FROM comments c WHERE c.uid = '#{request.headers['id']}'"]) 
			comments = Json::Builder.build(sanitized_query,userid,is_mobile).to_json
			comments = JSON.parse(comments)
			if userid != nil && comments
				comments = Json::Checker.checkComments(comments["comments"],userid)
			end
			if comments
				render json:{comments:comments}, status: :ok
			else
				render json:{}, status: :not_found
			end
		else
			render json: {message:'comment id (uid) is required'}, status: :bad_request
		end
	end

	def create
		puts params[:parent_uuid]
		user = User.find_by_token(request.headers["Authorization"].split(' ').last)
		if user 
			puts params[:parent_uuid]
			comment = Comment.new
			if params[:type] === 'music'
				#comment.song_id = params[:id]
				comment.commentable_type = 'Song'
				comment.commentable_uuid = params[:id]
				post = Song.where("uuid = ?", params[:id]).first
				comment.category = post ? post.main_genre : nil
				post.comment_count +=1
			elsif params[:type] === 'news'
				#comment.news_post_id = params[:id]
				comment.commentable_type = 'News_post'
				comment.commentable_uuid = params[:id]
				post = NewsPost.where("uuid = ?",params[:id]).first
				comment.category = post ? post.main_category : nil
				post.comment_count += 1
			elsif params[:type] === 'videos'
				#comment.video_id = params[:id]
				comment.commentable_type = 'Video'
				comment.commentable_uuid = params[:id]
				post = Video.where("uuid = ?", params[:id]).first
				comment.category = post ? post.main_category : nil
				post.comment_count += 1
			elsif params[:type] === 'apparel'
				comment.commentable_type = 'Apparel'
				comment.commentable_uuid = params[:id]
				post = ::Product.where("uuid = ?",params[:id]).first
				comment.category = post ? post.main_category : nil
				comment.subcategory = post ? post.sub_category : nil
				post.comment_count += 1
			elsif params[:type] === 'technology'
				comment.commentable_type = 'Technology'
				comment.commentable_uuid = params[:id]
				post = ::Product.where("uuid = ?",params[:id]).first
				comment.category = post ? post.main_category : nil
				comment.subcategory = post ? post.sub_category : nil
				post.comment_count += 1
			end
			if !post
				render json:{}, status: :bad_request
				return false
			end

			if post.locked
				render json:{locked:true, message:"this post has been locked"}, status: :forbidden
				return false
			elsif post.archived
				render json:{archived:true, message:"this post has been archived"}, status: :forbidden
				return false
			elsif post.deleted || post.hidden
				render json:{message:"this post has either been deleted or hidden"}, status: :forbidden
				return false
			elsif post.flagged
				render json:{flagged:true, message:"this post has been flagged"}, status: :forbidden
				return false
			end

			puts post.url
			puts post.title
			comment.url = post.url
			comment.title = post.title
			comment.user_id = user.id
			puts comment.url
			puts comment.title
			puts comment.category
			puts user.uuid
			comment.upvotes = 1
			comment.average_vote = 1
			comment.votes = {user.uuid => 1}
			comment.body = params[:body] ? params[:body] : ''
			comment.stripped = params[:marked] ? ActionView::Base.full_sanitizer.sanitize(params[:marked]) : '' ## remove all html tags
			comment.marked = params[:marked] ? ActionController::Base.helpers.sanitize(params[:marked]) : ''	## remove scripts and on* javascript
			comment.notified = params[:parent_uuid] ? false : true
			comment.parent_uuid = params[:parent_uuid] ? params[:parent_uuid] : nil
			comment.generation = params[:generation] ? params[:generation] : nil
			comment.post_type = params[:type] ? params[:type] : nil
			comment.post_id = params[:id] ? params[:id] : nil
			comment.generation = 0
			comment.submitted_by = user.username
			comment.uuid = Comment.setUUID
			comment.admin = user.admin ? true : false
			comment.seller = user.seller ? true : false
			comment.submitter = post.submitted_by === user.username ? true : false
			comment.styled = comment.admin || comment.seller || comment.submitter ? true : false
			if comment.save && post && post.save
				comment.time_ago = Time_ago::Time::single([comment]).first.time_ago
				render json: {comment:comment.as_json.except("id","updated_at", "user_id", "user_flagged", "flag_count", "flag_checked", "deleted_body", "deleted_submitted_by", "deleted_user_id", "hide_proccessing", "notified", "karma_update", "voted", "removed", "locked", "votes_ip", "uid","votes","report_users", "human_votes", "human_downvotes", "human_upvotes", "human_votes_count").merge!(:children => [], :user_voted => 1)}, status: :created
				if(params[:parent_uuid]) then NotificationcommentWorker.perform_async end
				PurgecacheWorker.perform_async('comment',comment.commentable_uuid,comment.post_type)
				PurgecacheWorker.perform_async(post.post_type,post.uuid,post.post_type)
				CheckcommentWorker.perform_async(comment.id)
			else
				render json: {}, status: :internal_server_error
				Rails.logger.info(comment.errors.inspect) 
			end

		else
			render json: {}, status: :unauthroized
		end

	end

	def edit
		user = User.find_by_token(request.headers["Authorization"].split(' ').last)
		if user 
			puts user.username
			comment = Comment.where("uuid = ?", params[:id]).first
			puts comment
            if !comment.locked || comment.admin
                if comment && !comment.deleted && !comment.removed
                    if comment.user_id = user.id
                    comment.body = params[:body] ? params[:body] : ''
                    comment.stripped = params[:marked] ? ActionView::Base.full_sanitizer.sanitize(params[:marked]) : '' ## remove all html tags
                    comment.marked = params[:marked] ? ActionController::Base.helpers.sanitize(params[:marked]) : ''	## remove scripts and on* javascript
                    comment.edited = true
                        if comment.save
							type = comment.parent_uuid ? 'reply' : 'comment'
                            render json:{body:comment.body,type:type,id:comment.uuid,marked:comment.marked}, status: :ok
							PurgecacheWorker.perform_async('comment',comment.commentable_uuid,comment.post_type)
							CheckcommentWorker.perform_async(comment.id)
                        else
                            render json:{}, status: :internal_server_error
                            Rails.logger.info(comment.errors.inspect) 
                        end
                    else
                        render json: {}, status: :bad_request
                    end
                else
                    render json: {}, status: :not_found
                end
            else
                render json: {locked:true}, status: :unauthroized
            end
		else
			render json: {}, status: :bad_request
		end
	end

	def delete
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
		if user 
			comment = params[:id] ? Comment.where("uuid = ?", params[:id]).first : nil
			if comment && !comment.deleted && !comment.removed
				if comment.user_id = user.id
					comment.deleted = true
					comment.deleted_submitted_by = comment.submitted_by
					comment.deleted_body = comment.body
					comment.deleted_user_id = comment.user_id
					comment.submitted_by = '[Deleted]'
					comment.body = '[Deleted]'
					comment.stripped = '[Deleted]'
					comment.marked = '[Deleted]'
					comment.user_id = 0
					comment.hidden = comment.replies.where('hidden = false').exists? ? false : true
					comment.hide_proccessing = comment.hidden ? true : false
					if comment.save
						render json:{hidden:comment.hidden}, status: :ok
						if comment.hidden then HidecommentWorker.perform_async end
					else
						render json:{}, status: :internal_server_error
						Rails.logger.info(comment.errors.inspect) 
					end
				else
					render json: {}, status: :bad_request
				end
			else
				render json: {}, status: :not_found
			end
		else
			render json: {}, status: :bad_request
		end
	end

end
