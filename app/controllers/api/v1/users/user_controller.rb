class Api::V1::Users::UserController < ApplicationController
	def read
			currentUser = request.headers["Authorization"] ?  User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
			user = User.select('songs,ratings,karma,comment_karma,average_rating,average_vote,videos,comments,apparel,technology,good_standing').where('username = ?', request.headers["user"]).first
			if user 
				comments = Comment.where('submitted_by = ? AND flagged = false AND removed = false', request.headers["user"]).order('created_at DESC').select_with(App.getGoodColumns('comments')).limit(5)
				songs = user.songs != '{}' ? Song.where('hidden = false AND deleted = false AND uuid IN (?) AND worked = true AND flagged = false AND removed = false', user.songs.keys).select_with(App.getGoodColumns('music')).limit(4) : []
				videos = user.videos != '{}' ? Video.where('hidden = false AND deleted = false AND uuid IN (?) AND worked = true AND flagged = false AND removed = false', user.videos.keys).select_with(App.getGoodColumns('videos')).limit(4) : []
				apparels = user.apparel != '{}' ? Product.where('hidden = false AND deleted = false AND uuid IN (?) AND uploaded = true AND flagged = false AND removed = false', user.apparel.keys).select_with(App.getGoodColumns('apparel')).limit(4).as_json.to_a : []
				technologies = user.technology != '{}' ? Product.where('hidden = false AND deleted = false AND uuid IN (?) AND uploaded = true AND flagged = false AND removed = false', user.technology.keys).select_with(App.getGoodColumns('technology')).limit(4).as_json.to_a : []
				allposts = Json::Checker.checkUser([],[songs],[videos],[apparels],[technologies],request.headers["Authorization"])
				comments.each do |comment|
					if currentUser
						comment_votes_hash = comment.votes
      					comment.as_json.merge!(user_voted: nil)
                    	## not sure why the above isn't appying - it will return null instead of 1. This needs to be looked into.
                    	comment["user_voted"] = Comment.user_voted(comment,currentUser.uuid)
						comment["time_ago"] = time_ago_in_words(comment["created_at"]).gsub('about ','') + ' ago'
					end
				end
				# 	videos.each do |video|
				# 		video.user_liked = JSON.parse(video.likes).key?(currentUser.uuid) ? true : false
				# 		video_votes_hash = JSON.parse(video.votes)
				# 		video.user_voted = video_votes_hash.key?(currentUser.uuid) ? video_votes_hash[currentUser.uuid] : nil
				# 		video.time_ago = time_ago_in_words(video.created_at).gsub('about ','') + ' ago'
				# 	end
				# 	songs.each do |song|
				# 		song.user_liked = JSON.parse(song.likes).key?(currentUser.uuid) ? true : false
				# 		song_votes_hash = JSON.parse(song.votes)
				# 		song.user_voted = song_votes_hash.key?(currentUser.uuid) ? song_votes_hash[currentUser.uuid] : nil
				# 		song.time_ago = time_ago_in_words(song.created_at).gsub('about ','') + ' ago'
				# 	end
				# 	apparels.each do |apparel|
				# 		apparel["user_liked"] = JSON.parse(apparel["likes"]).key?(currentUser.uuid) ? true : false
				# 		apparel_votes_hash = JSON.parse(apparel["votes"])
				# 		apparel["user_voted"] = apparel_votes_hash.key?(currentUser.uuid) ? apparel_votes_hash[currentUser.uuid] : nil
				# 	end
				# 	technologies.each do |technology|
				# 		technology["user_liked"] = JSON.parse(technology["likes"]).key?(currentUser.uuid) ? true : false
				# 		technology_votes_hash = JSON.parse(technology["votes"])
				# 		technology["user_voted"] = technology_votes_hash.key?(currentUser.uuid) ? technology_votes_hash[currentUser.uuid] : nil
				# 	end
				# end
				user.songs = allposts[1][0]
				user.videos = allposts[2][0]
				user.apparel = allposts[3][0]
				user.technology = allposts[4][0]
				#this is one of those times where I think ruby/rails is stupid.
					# You can't do user.comments = comments, but you can do user.comments << comments - but now it's user.comments[0]
						# From my sad attempt at a serializer, it will return two empty arrays, while without the serialize it just shows the active record pointer.
							# basically, serialize :comments
					# The comments KV in the render comes back quite fucking normal too.
				# user.comments << comments - user.comments[0]
				# user.comments = comments - active record pointer. 
				# I could do comments = Comment.where('submitted_by = ?', request.headers["user"]).map(&:to_json) but I need a JSON in an object, not a string. 
					# Having the client side loop through the comments and doing JSON.parse is asking for quite a lot.

				# works, but we're looping.
				comments.each do |comment|
					user.comments << comment
				end

				render json: {status:200, success:true, user:user, comments:comments}
			else
				render json: {status:404, success: false}
			end
	end
end
