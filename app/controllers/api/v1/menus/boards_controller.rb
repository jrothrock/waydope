class Api::V1::Menus::BoardsController < ApplicationController
	def index
			posts = $redis.get("news_menu_posts")
			if posts.nil?
				all_posts  = NewsPost.where("flagged = false AND removed = false").select_with(App.getGoodColumns('news')).order('hotness DESC, average_vote DESC,created_at DESC').limit(3)
				new_posts  = NewsPost.where("flagged = false AND worked = true AND removed = false").select_with(App.getGoodColumns('news')).order('created_at DESC').limit(3)
				featured_posts = NewsPost.where("flagged = false AND worked = true AND removed = false").select_with(App.getGoodColumns('news')).order('RANDOM()').limit(3)
				if !$redis.exists("news_menu_ids") then App.cache_menu([all_posts,new_posts,featured_posts],'news') end
				posts = [all_posts,new_posts,featured_posts].to_json
				$redis.set("news_menu_posts",posts)
				$redis.rpush("news_menu_keys","news_menu_posts")
			end
			posts = JSON.parse(posts) 
			posts = NewsPost.userCheck(posts, request.headers["Authorization"])
		#end
		
		render json:{status:200, success:true, posts:posts}
	end
end
