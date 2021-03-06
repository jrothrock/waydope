class Api::V1::Likes::LikesController < ApplicationController
	def create
		if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)
			if user 
				type = params[:type]

				if type === 'music'
					post = Song.where("uuid = ?", params[:id]).first
					typeFind = 'songs'
				elsif type === 'videos'
					post = Video.where("uuid = ?", params[:id]).first
					typeFind = 'videos'
				elsif type === 'news'
					post = NewsPost.where("uuid = ?", params[:id]).first
					typeFind = 'news_posts'
					#userType = user.news_posts
				elsif type === 'apparel'
					post = Product.where("uuid = ?", params[:id]).first
					typeFind = 'apparel'
				elsif type === 'technology'
					post = Product.where("uuid = ?", params[:id]).first
					typeFind = 'technology'
				end

				if !post 
					render json:{}, status: :not_found
					return false
				end
				if post.archived
					render json:{archived:true, message:"this post has been archived"}, status: :forbidden
					return false
				elsif post.locked
					render json:{locked:true, message:"this post has been locked"}, status: :forbidden
					return false
				elsif post.deleted || post.hidden 
					render json:{message:"this post has been either deleted or made hidden"}, status: :forbidden
					return false
				elsif post.flagged
					render json:{flagged:true, message:"this post has been flagged"}, status: :forbidden
					return false
				end

				# puts request.remote_ip
				# puts request.ip
				likes_ip_hash = post.likes_ip
				if post.likes.key?(user.uuid)
					post.likes = post.likes.except(user.uuid) #basically, turn into a hash, remove the key, turn it back into json.
					post.likes_count -= 1
					if likes_ip_hash.key?(request.remote_ip)
						if likes_ip_hash[request.remote_ip] == 2
							likes_ip_hash[request.remote_ip] = 1
						else
							likes_ip_hash.except(request.remote_ip)
						end
					end
					post.human_likes = post.likes.except(user.uuid)
					post.likes_ip = likes_ip_hash
					user_likes =  user[typeFind].except(post.uuid.to_s)
					user[typeFind] = user_likes
					user_liked = false
				else 
					likes_ip_hash = post.likes_ip
					if likes_ip_hash.key?(request.remote_ip)
						# let the botter do two votes, then stop them. They put in some effort.
						if likes_ip_hash[request.remote_ip] > 1
							# Make the botter think they successfully submitted it, but they didn't.
							render json:{}, status: :ok
							return false
						else
							likes_ip_hash[request.remote_ip] = 2
						end
					else
						likes_ip_hash[request.remote_ip] = 1
					end
					human_likes_hash = post.human_likes
					human_likes_hash[user.uuid] = true
					post.human_likes = human_likes_hash
					post.likes_ip = likes_ip_hash
					post_hash = post.likes
					post_hash[user.uuid] = true
					post.likes = post_hash
					post.likes_count += 1
					
					user_hash = user[typeFind]
					user_hash[post.uuid] = true
					puts user_hash
					user[typeFind] = user_hash
					puts user[typeFind]
					user_liked = true
				end

				if post.save && user.save
					render json: {user_liked:user_liked, likes_count:post.likes_count}, status: :ok
					PurgecacheWorker.perform_async(post.post_type,post.uuid)
				else
					render json: {}, status: :internal_server_error
					Rails.logger.info(post.errors.inspect) 
					Rails.logger.info(user.errors.inspect) 
				end
			else
				render json: {}, status: :unauthorized
			end
		else
			render json: {}, status: :unauthorized
		end
	end
end
