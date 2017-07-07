class Api::V1::Menus::ApparelController < ApplicationController
	def index
		posts = $redis.get("apparel_menu_posts")
		if posts.nil?
			hot_apparel =  ::Product.where("post_type = 'apparel' AND sold_out = false AND approved = true AND worked = true AND uploaded = true AND flagged = false AND removed = false").select_with(App.getGoodColumns('apparel')).order("average_vote DESC, created_at DESC").limit(3).as_json(include: :photos)
			new_apparel =  ::Product.where("post_type = 'apparel' AND sold_out = false AND approved = true AND worked = true AND uploaded = true AND flagged = false AND removed = false").select_with(App.getGoodColumns('apparel')).order("created_at DESC").limit(3).as_json(include: :photos)
			featured_apparel =  ::Product.where("post_type = 'apparel' AND sold_out = false AND featured = true AND approved = true AND worked = true AND uploaded = true AND flagged = false AND removed = false").select_with(App.getGoodColumns('apparel')).limit(3).as_json(include: :photos)
			if !$redis.exists("apparel_menu_ids") then App.cache_menu([hot_apparel,new_apparel,featured_apparel],'apparel') end
			posts = [hot_apparel,new_apparel,featured_apparel].to_json
			$redis.set("apparel_menu_posts",posts)
			$redis.rpush("apparel_menu_keys","apparel_menu_posts")
		end
		posts = JSON.parse(posts)
		apparel = Product.userCheck(posts, request.headers["Authorization"])
		render json:{posts:apparel}, status: :ok
	end
end
