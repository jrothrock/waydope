class Api::V1::Menus::TechnologyController < ApplicationController
	def index
		posts = $redis.get("technology_menu_posts")
		if posts.nil?
			hot_technology =  ::Product.where("post_type = 'technology' AND sold_out = false AND approved = true AND worked = true AND uploaded = true AND flagged = false AND removed = false").order("average_vote DESC, created_at DESC").select_with(App.getGoodColumns('technology')).limit(3).as_json(include: :photos)
			new_technology =  ::Product.where("post_type = 'technology' AND sold_out = false AND approved = true AND worked = true AND uploaded = true AND flagged = false AND removed = false").order("created_at DESC").select_with(App.getGoodColumns('technology')).limit(3).as_json(include: :photos)
			featured_technology =  ::Product.where("post_type = 'technology' AND sold_out = false AND featured = true AND approved = true AND worked = true AND uploaded = true AND flagged = false AND removed = false").limit(3).select_with(App.getGoodColumns('technology')).as_json(include: :photos)
			if !$redis.exists("technology_menu_ids") then App.cache_menu([hot_technology,new_technology,featured_technology],'technology') end
			posts = [hot_technology,new_technology,featured_technology].to_json
			$redis.set("technology_menu_posts",posts)
			$redis.rpush("technology_menu_keys","technology_menu_posts")
		end
		posts = JSON.parse(posts)
		technology = Product.userCheck(posts, request.headers["Authorization"])
		render json:{posts:technology}, status: :ok
	end
end
