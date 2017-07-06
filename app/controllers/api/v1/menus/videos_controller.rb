class Api::V1::Menus::VideosController < ApplicationController
	def index
		posts = $redis.get("videos_menu_posts")
		if posts.nil?
			hot_videos = Video.where('worked = true AND uploaded = true AND flagged = false AND removed = false').order('hotness DESC, average_vote DESC,created_at DESC').select_with(App.getGoodColumns('videos')).all.limit(3)
			new_video = Video.where('worked = true AND uploaded = true AND flagged = false AND removed = false').order('created_at DESC').select_with(App.getGoodColumns('videos')).all.limit(3)
			featured_video = Video.where('worked = true AND uploaded = true AND flagged = false AND removed = false AND featured = true').order('RANDOM()').select_with(App.getGoodColumns('videos')).all.limit(3)
			if !$redis.exists("videos_menu_ids") then App.cache_menu([hot_videos,new_video,featured_video],'videos') end
			posts = [hot_videos,new_video,featured_video].to_json
			$redis.set("videos_menu_posts",posts)
			$redis.rpush("videos_menu_keys","videos_menu_posts")
		end
		posts = JSON.parse(posts)
		videos = Video.userCheck(posts, request.headers["Authorization"])
		#posts = News_post.userCheck([all,first,second,third,fourth], request.headers["Authorization"])
		render json:{status:200, success:true, posts:videos}
	end
end
