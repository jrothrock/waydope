class Api::V1::Home::HomeController < ApplicationController

	def index
		posts = $redis.get("home_posts")
		if posts.nil?
	
			sanitized_query = NewsPost.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('news',true,'np')} FROM news_posts np WHERE categorized = true AND flagged = false AND removed = false GROUP BY np.id ORDER BY hotness DESC, average_vote DESC, created_at DESC OFFSET 0 LIMIT 5"]) 
			hotNews = NewsPost.find_by_sql(sanitized_query)
			sanitized_query = NewsPost.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('news',true,'np')} FROM news_posts np WHERE categorized = true AND flagged = false AND removed = false GROUP BY np.id ORDER BY created_at DESC OFFSET 0 LIMIT 5"]) 
			newNews = NewsPost.find_by_sql(sanitized_query)
			sanitized_query = NewsPost.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('news',true,'np')} FROM news_posts np WHERE categorized = true AND featured = true AND flagged = false AND removed = false GROUP BY np.id ORDER BY RANDOM() OFFSET 0 LIMIT 5"]) 
			featuredNews = NewsPost.find_by_sql(sanitized_query)

			sanitized_query = Song.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE worked = true AND categorized = true AND uploaded = true AND flagged = false AND removed = false GROUP BY s.id ORDER BY hotness DESC, average_vote DESC, created_at DESC OFFSET 0 LIMIT 4"]) 
			hotMusic = Song.find_by_sql(sanitized_query)
			sanitized_query = Song.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE worked = true AND categorized = true AND uploaded = true AND flagged = false AND removed = false GROUP BY s.id ORDER BY created_at DESC OFFSET 0 LIMIT 4"]) 
			newMusic = Song.find_by_sql(sanitized_query)
			sanitized_query = Song.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('music',true,'s')} FROM songs s WHERE worked = true AND categorized = true AND uploaded = true AND featured = true AND flagged = false AND removed = false GROUP BY s.id ORDER BY RANDOM() OFFSET 0 LIMIT 4"]) 
			featuredMusic = Song.find_by_sql(sanitized_query)
			
			sanitized_query = Video.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE worked = true AND categorized = true AND uploaded = true AND flagged = false AND removed = false GROUP BY v.id ORDER BY hotness DESC, average_vote DESC, created_at DESC OFFSET 0 LIMIT 4"]) 
			hotVideos = Video.find_by_sql(sanitized_query)
			sanitized_query = Video.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE worked = true AND categorized = true AND uploaded = true AND flagged = false AND removed = false GROUP BY v.id ORDER BY created_at DESC OFFSET 0 LIMIT 4"]) 
			newVideos = Video.find_by_sql(sanitized_query)
			sanitized_query = Video.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('videos',true,'v')} FROM videos v WHERE worked = true AND categorized = true AND uploaded = true AND featured = true AND flagged = false AND removed = false GROUP BY v.id ORDER BY RANDOM() OFFSET 0 LIMIT 4"]) 
			featuredVideos = Video.find_by_sql(sanitized_query)

			sanitized_query = ::Product.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND flagged = false AND removed = false GROUP BY p.id ORDER BY hotness DESC, average_vote DESC, created_at DESC OFFSET 0 LIMIT 4"]) 
			hot_apparel = ::Product.find_by_sql(sanitized_query).as_json(include: :photos).to_a
			sanitized_query = ::Product.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND approved = true AND uploaded = true AND flagged = false AND removed = false GROUP BY p.id ORDER BY created_at DESC OFFSET 0 LIMIT 4"]) 
			new_apparel = ::Product.find_by_sql(sanitized_query).as_json(include: :photos).to_a
			sanitized_query = ::Product.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('apparel',true,'p')} FROM products p WHERE post_type = 'apparel' AND sold_out = false AND featured = true AND approved = true AND uploaded = true AND flagged = false AND removed = false GROUP BY p.id ORDER BY RANDOM() OFFSET 0 LIMIT 4"]) 
			featured_apparel = ::Product.find_by_sql(sanitized_query).as_json(include: :photos).to_a
			
			sanitized_query = ::Product.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('technology',true,'p')} FROM products p WHERE post_type = 'technology' AND sold_out = false AND approved = true AND uploaded = true AND flagged = false AND removed = false GROUP BY p.id ORDER BY hotness DESC, average_vote DESC, created_at DESC OFFSET 0 LIMIT 4"]) 
			hot_technology = ::Product.find_by_sql(sanitized_query).as_json(include: :photos).to_a
			sanitized_query = ::Product.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('technology',true,'p')} FROM products p WHERE post_type = 'technology' AND sold_out = false AND approved = true AND uploaded = true AND flagged = false AND removed = false GROUP BY p.id ORDER BY created_at DESC OFFSET 0 LIMIT 4"]) 
			new_technology = ::Product.find_by_sql(sanitized_query).as_json(include: :photos).to_a
			sanitized_query = ::Product.escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns('technology',true,'p')} FROM products p WHERE post_type = 'technology' AND sold_out = false AND featured = true AND approved = true AND uploaded = true AND flagged = false AND removed = false GROUP BY p.id ORDER BY RANDOM() OFFSET 0 LIMIT 4"]) 
			featured_technology = ::Product.find_by_sql(sanitized_query).as_json(include: :photos).to_a
			
			if !$redis.exists("home_type_keys") then App.set_home_cache_keys([hotNews,newNews,featuredNews],[hotMusic,newMusic,featuredMusic],[hotVideos,newVideos,featuredVideos],[hot_apparel,new_apparel,featured_apparel],[hot_technology,new_technology,featured_technology]) end
			posts = [[hotNews,newNews,featuredNews],[hotMusic,newMusic,featuredMusic],[hotVideos,newVideos,featuredVideos],[hot_apparel,new_apparel,featured_apparel],[hot_technology,new_technology,featured_technology]].to_json
			$redis.set("home_posts",posts)

		end
		posts = JSON.parse(posts)
		allposts = Json::Checker.checkUser(posts[0],posts[1],posts[2],posts[3],posts[4],request.headers["Authorization"])
		
		render json:{
					status:200, success:true, 
					news:[allposts[0][0],allposts[0][1],allposts[0][2]],
					music: [allposts[1][0],allposts[1][1],allposts[1][2]],
					videos: [allposts[2][0],allposts[2][1],allposts[2][2]],
					apparel:[allposts[3][0],allposts[3][1],allposts[3][2]],
					technology:[allposts[4][0],allposts[4][1],allposts[4][2]]
				}
	end

	def read
		if request.headers["type"] && request.headers["offset"] && request.headers["category"]
			offset = request.headers["offset"].to_i ? request.headers["offset"].to_i : 0
			where = App.whereType(request.headers["type"], request.headers["category"])
			type = App.typeGet(request.headers["type"])
			order = App.orderGet(request.headers["type"], request.headers["category"])
			model = App.classGet(request.headers["type"])
			limit = request.headers["type"] === 'news' ? 5 : 4
			sanitized_query =  Object.const_get(model).escape_sql(["SELECT count(*) OVER () AS total_count, #{App.getGoodColumns(request.headers["type"],true)} FROM #{type} WHERE #{where} ORDER BY #{order} OFFSET ? LIMIT ?",offset,limit])
			if type != 'products'
				posts =  Object.const_get(model).find_by_sql(sanitized_query)
			else
				posts =  Object.const_get(model).find_by_sql(sanitized_query).as_json
			end
			checked = Json::Checker.singleCheck(posts, request.headers["type"], request.headers["Authorization"])

			if posts 
				render json:{status:200, success:true, posts:checked}
			else
				render json:{status:404, success:false}
			end
		else
			render json:{status:400, success:false, message: 'type, offset, and category parameters are required'}
		end
	end
end
