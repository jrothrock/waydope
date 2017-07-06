class Api::V1::Admin::MainController < ApplicationController
		def index #all songs
		if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)

			new_news_posts = NewsPost.where("checked = false").count
			new_songs = Song.where('checked = false').count
			new_videos = Video.where('checked = false').count
			new_apparel = Product.where('checked = false').count
			new_technology = Product.where('checked = false').count
			new_comments = Product.where('checked = false').count
			
			new_apparel_flags = Product.where("post_type = 'apparel' AND flagged = true").count
			new_news_flags = NewsPost.where('flagged = true').count
			new_songs_flags = Song.where('flagged = true').count
			new_videos_flags = Video.where("flagged = true").count
			new_technology_flags = Product.where("post_type = 'technology' AND flagged = true").count

			report_comments = Comment.where("reported = true AND flag_checked = false").count
			report_apparel = Product.where("post_type = 'apparel' AND reported = true AND flag_checked = false").count
			report_news = NewsPost.where("reported = true AND flag_checked = false").count
			report_music = Song.where("reported = true AND flag_checked = false").count
			report_videos = Video.where("reported = true AND flag_checked = false").count
			report_technology = Product.where("post_type = 'technology' AND reported = true AND flag_checked = false").count

			total_comments = Comment.count
			total_news_posts = NewsPost.where("categorized = true").count
			total_songs = Song.where("worked = true").count
			total_videos = Video.where("worked = true").count
			total_apparel = Product.where("post_type = 'apparel' AND worked = true").count
			total_technology = Product.where("post_type = 'technology' AND worked = true").count

			if user && user.admin
				render json: {
								status: 200, success: true, 
								users: {total_users: User.count, logged_in:User.where(:logged_in => true).count, total_admins:User.where(:admin => true).count, total_banned:User.where(:good_standing => false).count,total_humans:User.where("human=true").count,total_bots:User.where("human=false").count}, 
								new:{comments:new_comments,news:new_news_posts,songs:new_songs,videos:new_videos,apparel:new_apparel,technology:new_technology},
								reports:{comments:report_comments,news:report_news,songs:report_music,videos:report_videos,apparel:report_apparel,technology:report_technology},
								flags:{apparel:new_apparel_flags,news:new_news_flags,songs:new_songs_flags,videos:new_videos_flags,technology:new_technology_flags},
								totals:{comments:total_comments,news:total_news_posts,songs:total_songs,videos:total_videos,apparel:total_apparel,technology:total_technology}
								# news:{ total_news_posts:NewsPost.count},
								# songs:{total_songs:Song.count, total_electronic:Song.where(:genre => 'electronic').count, total_hiphop:Song.where(:genre => 'hip-hop').count, total_house:Song.where(:genre => 'house').count, total_trap:Song.where(:genre => 'trap').count}, 
								# videos:{total_videos:Video.count, total_feelgood:Video.where(:category => 'feel-good').count, total_funny:Video.where(:category => 'funny').count, total_ohshit:Video.where(:category => 'ohshit').count}
							}
			else
				render json: {status: 403, success:false}
			end
		else
			render json: {status: 403, success:false}
		end
	end
end
