class Api::V1::Menus::MusicController < ApplicationController
	def index
		posts = $redis.get("music_menu_posts")
		if posts.nil?
			hot_songs = Song.where('worked = true AND uploaded = true AND flagged = false AND removed = false').order('hotness DESC, average_vote DESC,created_at DESC').select_with(App.getGoodColumns('music')).all.limit(3)
			new_songs = Song.where('worked = true AND uploaded = true AND flagged = false AND removed = false').order('created_at DESC').select_with(App.getGoodColumns('music')).all.limit(3)
			featured_song = Song.where('worked = true AND uploaded = true AND flagged = false AND removed = false AND featured = true').order('RANDOM()').select_with(App.getGoodColumns('music')).all.limit(3)
			if !$redis.exists("music_menu_ids") then App.cache_menu([hot_songs,new_songs,featured_song],'music') end
			posts = [hot_songs,new_songs,featured_song].to_json
			$redis.set("music_menu_posts",posts)
			$redis.rpush("music_menu_keys","music_menu_posts")
		end
		posts = JSON.parse(posts)
		songs = Song.userCheck(posts, request.headers["Authorization"])
		render json:{posts:songs}, status: :ok
	end
end
