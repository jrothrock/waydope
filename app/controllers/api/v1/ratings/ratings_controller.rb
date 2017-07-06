class Api::V1::Ratings::RatingsController < ApplicationController
	
	def create
		#
		# comeback and edit this.
		#
		# if (!Song.checkRatings(params))
		# 	render json: {status:500,success:false}
		# 	Rails.logger.info('checkRatings failed') 
		# 	return false
		# end
		user = User.find_by_token(request.headers["Authorization"].split(' ').last)
		if user 
			lyrics = params[:lyrics] && params[:lyrics].to_i > -1 && params[:lyrics] < 101 ? params[:lyrics] : nil
			originality = params[:originality] && params[:originality].to_i > -1 && params[:originality].to_i < 101 ? params[:originality] : nil
			production = params[:production] && params[:production].to_i > -1 && params[:production].to_i < 101 ? params[:production] : nil

			type = params[:type]
			rating = params[:simpleRating] && params[:simpleRating].to_i > -1 && params[:simpleRating].to_i < 101 ? params[:simpleRating] : nil
			if !rating then rating = params[:advancedRating] && params[:advancedRating].to_i > -1 && params[:advancedRating].to_i < 101 ? params[:advancedRating] : nil end
			if !rating then rating = params[:rating] && params[:rating].to_i > -1 && params[:rating].to_i < 101 ? params[:rating] : nil end

			if type === 'music'
				post = Song.where("uuid = ?", params[:id]).first
			elsif type === 'videos'
				post = Video.where("uuid = ?", params[:id]).first
			elsif type === 'news'
				post = NewsPost.where("uuid = ?", params[:id]).first
			elsif type === 'apparel' || type === 'technology'
				post = Product.where("uuid = ?", params[:id]).first
			end
			
			if !post
				render json:{status:404, success:false}
				return false
			end

			if rating < 50
				render json:{status:400,success:false, poor_rating:true, message:"Is the song really that bad? Lowest rating can be 50..."}
				return false
			end

			if post.archived
				render json:{status:403, success:false, archived:true, message:"this post has been archived."}
				return false
			elsif post.locked
				render json:{status:403, success:false, locked:true, message:"this post has been locked"}
				return false
			elsif post.deleted || post.hidden
				render json:{status:403, success:false, message:"this post has either been deleted, hidden, or removed"}
				return false
			elsif post.flagged
				render json:{status:403, success:false, flagged:true, message:"this post has been flagged"}
				return false
			end
			ratings_ip_hash = post.ratings_ip
			if(ratings_ip_hash.key?(request.remote_ip))
				if(ratings_ip_hash[request.remote_ip] > 1)
					# allow the botter to do two rates, they put in the effort, then fail silently.
					render json:{status:200, success:true, average_rating:(((post.average_rating * post.ratings_count) + rating)/(post.ratings_count + 1)), ratings_count:post.ratings_count + 1, average_simplified_rating:post.average_simplified_rating,average_simplified_rating_count:post.average_simplified_rating_count}
					return false
				else
					ratings_ip_hash[request.remote_ip] = 2
				end
			else
				ratings_ip_hash[request.remote_ip] = 1
			end
			post.ratings_ip = ratings_ip_hash
			puts post.ratings_ip
			puts 'before rating'
			if rating
				puts 'in rating'
				if post.ratings != '{}'
					puts 'in has values'
					ratings_hash = post.ratings
					ratings_hash[user.uuid] = rating
					post.ratings = ratings_hash
				else 
					puts 'in else'
					post.ratings = {user.uuid => rating}
				end
				if post.human_ratings != '{}'
					ratings_hash = post.human_ratings
					ratings_hash[user.uuid] = rating
					post.human_ratings = ratings_hash
				else
					post.human_ratings = {user.uuid => rating}
				end
			end

			if type != 'apparel' && type != 'technology'
				puts type
				puts 'in type not apparel or technology'
				if params[:advancedRating] != nil && params[:simpleRating] != nil
					render json: {status:500, success:false}
					Rails.logger.info('has both advancedRating and rating') 
					return false
				end
				if params[:advancedRating]
					if lyrics
						post.average_lyrics_rating = ((post.average_lyrics_rating*post.average_lyrics_rating_count)+lyrics)/(post.average_lyrics_rating_count+1)
						post.average_lyrics_rating_count += 1
						# post.average_lyrics_rating_variance = (post.average_lyrics_variance ** 2 + (lyrics-post.average_lyrics_rating).abs ** 2) / post.average_lyrics_rating_count
						# post.average_lyrics_rating_deviation = Math.sqrt(post.average_lyrics_rating_variance)
						post.human_average_lyrics_rating = ((post.human_average_lyrics_rating*post.human_average_lyrics_rating_count)+lyrics)/(post.human_average_lyrics_rating_count+1)
						post.human_average_lyrics_rating_count += 1
					end
					if production
						post.average_production_rating = ((post.average_production_rating * post.average_production_rating_count)+production)/(post.average_production_rating_count + 1)
						post.average_production_rating_count += 1
						# post.average_production_rating_variance = (post.average_lyrics_rating_variance ** 2 + (production-post.average_production_rating).abs ** 2) / post.average_production_rating_count
						# post.average_production_rating_deviation = Math.sqrt(post.average_lyrics_rating_variance)
						post.human_average_production_rating = ((post.human_average_production_rating * post.human_average_production_rating_count)+production)/(post.human_average_production_rating_count + 1)
						post.human_average_production_rating_count += 1
					end
					if originality
						post.average_originality_rating = ((post.average_originality_rating * post.average_originality_rating_count)+originality)/(post.average_originality_rating_count+1)
						post.average_originality_rating_count += 1
						# post.average_originality_rating_variance = (post.average_originality_rating_variance ** 2 + (originality - post.average_originality_rating).abs ** 2)/ post.average_originality_rating_count
						#post.average_originality_rating_deviation = Math.sqrt(post.average_originality_rating_variance)
						post.human_average_originality_rating = ((post.human_average_originality_rating * post.human_average_originality_rating_count)+originality)/(post.human_average_originality_rating_count+1)
						post.human_average_originality_rating_count += 1
					end
					if rating
						post.average_advanced_rating = ((post.average_advanced_rating * post.average_advanced_rating_count) + rating) / (post.average_advanced_rating_count + 1)
						post.average_advanced_rating_count += 1
						# post.average_advanced_rating_variance = (post.average_advanced_rating_variance ** 2 + (rating- post.average_advanced_rating).abs ** 2)/ post.average_advanced_rating_count
						# post.average_advanced_rating_deviation = Math.sqrt(post.average_advanced_rating_variance)
						post.human_average_advanced_rating = ((post.human_average_advanced_rating * post.human_average_advanced_rating_count) + rating) / (post.human_average_advanced_rating_count + 1)
						post.human_average_advanced_rating_count += 1
					end
					advaned_ratings_hash = post.advanced_ratings
					advaned_ratings_hash[user.uuid] = {"advanced_rating" => rating, "lyrics" => lyrics, "originality" => originality, "production" => production}
					post.advanced_ratings = advaned_ratings_hash
				end
				if params[:simpleRating] && rating
					post.average_simplified_rating = ((post.average_simplified_rating * post.average_simplified_rating_count)+rating) / (post.average_simplified_rating_count + 1)
					post.average_simplified_rating_count += 1
					# post.average_simplified_rating_variance = (post.average_simplified_rating_variance ** 2 + (rating- post.average_simplified_rating).abs ** 2)/ post.average_simplified_rating_count
					# post.average_simplified_rating_deviation = Math.sqrt(post.average_simplified_rating_variance)
					post.human_average_simplified_rating = ((post.human_average_simplified_rating * post.human_average_simplified_rating_count)+rating) / (post.human_average_simplified_rating_count + 1)
					post.human_average_simplified_rating_count += 1
				end
				if rating
					post.average_rating = ((post.average_rating * post.ratings_count)+rating.to_i)/(post.ratings_count + 1)
					post.ratings_count += 1
					post.human_average_rating = ((post.human_average_rating * post.human_ratings_count)+rating.to_i)/(post.human_ratings_count + 1)
					post.human_ratings_count += 1
					# post.average_rating_variance += (post.average_rating_variance ** 2 + (rating-post.average_rating).abs ** 2) / post.ratings_count
					# post.average_rating_deviation = Math.sqrt(post.average_rating_variance)
					user.ratings << [rating,type,post.uuid]
					user.ratings_songs_ids << post.uuid
					user.ratings_songs << rating
					user.average_rating = ((user.average_rating * user.ratings_count)+rating.to_i)/(user.ratings_count+1)
					user.average_rating_songs = ((user.average_rating_songs * user.ratings_songs_count)+rating.to_i)/(user.ratings_songs_count+1)
					user.ratings_count += 1
					user.ratings_songs_count +=1
				end
			else
				puts 'in type else'
				if rating
					post.average_rating = ((post.average_rating * post.ratings_count) + params[:rating].to_i)/(post.ratings_count + 1)
					user.ratings << [rating,type,post.uuid]
					post.ratings_count += 1
					# post.average_rating_variance += (post.average_rating_variance ** 2 + (rating-post.average_rating).abs ** 2) / post.ratings_count
					# post.average_rating_deviation = sqrt.(post.average_rating_variance)
					if params[:fit]
						if  post.fit === '{}'  
							post.fit = {'small'=>0,
										'a little small' => 0,
										'perfect' => 0,
										'a little big' => 0,
										'big' => 0
										}
						end 
						post_fit_hash = post.fit
						if post_fit_hash.key?(params[:fit].downcase) then post_fit_hash[params[:fit].to_s.downcase] = (post_fit_hash[params[:fit].to_s].to_i + 1) end
						post.fit_count = post_fit_hash.key?(params[:fit]) ? (post.fit_count + 1) : post.fit_count
						post.fit = post_fit_hash
					end
				end

			end
			if post.save && user.save
				if type === 'music'
					render json: {status:200, success:true, average_rating:post.average_rating, average_rating_count:post.ratings_count, average_simplified_rating:post.average_simplified_rating,average_simplified_rating_count:post.average_simplified_rating_count,average_advanced_rating:post.average_advanced_rating, average_advanced_rating_count:post.average_advanced_rating_count,average_lyrics_rating:post.average_lyrics_rating,average_lyrics_rating_count:post.average_lyrics_rating_count,average_production_rating:post.average_production_rating,average_production_rating_count:post.average_production_rating_count,average_originality_rating:post.average_originality_rating,average_originality_rating_count:post.average_originality_rating_count}
					PurgecacheWorker.perform_async(post.post_type,post.uuid)
				else
					render json: {status:200, success:true, average_rating:post.average_rating, ratings_count:post.ratings_count, average_simplified_rating:post.average_simplified_rating,average_simplified_rating_count:post.average_simplified_rating_count}
				end
			else
				render json: {status:500, success:false}
				Rails.logger.info(post.errors.inspect) 
			end
		else
			render json: {status:401, success:false}
		end
	end
end
