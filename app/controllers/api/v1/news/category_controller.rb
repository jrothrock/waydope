class Api::V1::News::CategoryController < ApplicationController
	def index
		if request.headers["Category"]
			#posts = News_post.find_by_category(request.headers["Category"],10)
			# count = News_post.where('main_category = ?', request.headers["Category"]).count
			offset = request.headers["offset"].to_i % 20 === 0 && request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i + 3 : 0 # not a terrible sanitation honestly.
			sanitizedTime = Song.sanitizeTime(request.headers["time"].to_s)
			time = sanitizedTime ? sanitizedTime : 10.years.ago
			sanitizedOrder = Song.sanitizeOrder(request.headers["order"].to_s,request.headers["type"].to_s)
			order = sanitizedOrder ? sanitizedOrder : "hotness DESC, average_vote DESC, comment_count DESC"
			#
			#for some weird reason you can't do the '?' in the order by and have to do #{} instead. throws some no constant error. No idea.
			#
			posts = $redis.get("news_category_#{request.headers["Category"]}_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_posts")
			if posts.nil?
				if request.headers["Category"] === 'hot'
					sanitized_query = NewsPost.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('news',true,'np')} FROM news_posts np WHERE categorized = true AND flagged = false AND removed = false AND created_at >= ? GROUP BY np.id ORDER BY #{order} OFFSET ? LIMIT 20",time.to_s,offset])
				elsif request.headers["Category"] === 'new'
					sanitized_query = NewsPost.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('news',true,'np')} FROM news_posts np WHERE categorized = true AND flagged = false AND removed = false GROUP BY np.id ORDER BY created_at DESC OFFSET ? LIMIT 20", offset])
				elsif request.headers["Category"] === 'featured'
					sanitized_query =  NewsPost.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('news',true,'np')} FROM news_posts np WHERE created_at >= ? AND worked = true AND flagged = false AND removed = false AND featured = true GROUP BY np.id ORDER BY #{order} OFFSET ? LIMIT 20", time.to_s,offset])
				else
					puts 'in else'
					puts request.headers["category"]
					sanitized_query = NewsPost.escape_sql(["SELECT count(*) OVER (), #{App.getGoodColumns('news',true,'np')} FROM news_posts np WHERE main_category = ? AND created_at >= ? AND worked = true AND flagged = false AND removed = false GROUP BY np.id ORDER BY #{order} OFFSET ? LIMIT 20",request.headers["Category"], time.to_s,offset])
				end
				posts = NewsPost.find_by_sql(sanitized_query).to_json
				$redis.set("news_category_#{request.headers["Category"]}_#{offset}_#{time.strftime("%F")}_#{order.parameterize}_posts",posts)
			end
			posts = JSON.parse(posts)
			puts posts.first
			count = posts && posts.first ? posts.first["count"] : 0
			page = offset > 0 ? offset / 20 : 1
			pages = (count / 20.0).ceil
			checkedPosts = NewsPost.userCheck([posts.to_a],request.headers["Authorization"])
			if posts != []
				render json:{posts:checkedPosts[0], offset:0,count:count,page:page, pages:pages}, status: :ok
			else
				render json:{}, status: :not_found
			end
		else
			render json:{message:'Category param is required.'}, status: :bad_request
		end
	end
end
