class Api::V1::Votes::VotesController < ApplicationController
	def create
		user = User.find_by_token(request.headers["Authorization"].split(' ').last)
		if user 
			type = params[:type].downcase
			vote = params[:vote]
			og_vote = params[:vote]
			puts type
			puts vote
			if type === 'videos'
				post = Video.where("uuid = ?",params[:id]).first
			elsif type === 'music'
				post = Song.where("uuid = ?",params[:id]).first
			elsif type === 'news'
				post = NewsPost.where("uuid = ?",params[:id]).first
			elsif type === 'apparel' || type === 'technology'
				post = ::Product.where("uuid = ?",params[:id]).first
			elsif type === 'comment' || type === 'reply'
				post = Comment.where("uuid = ?",params[:id]).first
			end
			if !post
				render json:{}, status: :not_found
				return false
			end
			
			if post.archived
				render json:{archived:true, message:"post is archived"}, status: :forbidden
				return false
			elsif post.locked
				render json:{locked:true, message:"post has been locked"}, status: :forbidden
				return false
			elsif post.deleted || post.hidden || ((type === 'comment' || type === 'reply') && post.removed)
				render json:{message:"post has been either, hidden, deleted, or removed."}, status: :forbidden
				return false
			elsif post.flagged
				render json:{flagged:true, message:"post has been flagged"}, status: :forbidden
				return false
			end
			if post.votes.key?(user.uuid) && post.votes[user.uuid].to_i === vote.to_i 
				post.votes = post.votes.except(user.uuid)
				post.human_votes = post.human_votes.except(user.uuid)
				post.votes_count -= 1
				post.human_votes_count -=1
				if vote.to_i === -1
					post.downvotes -= 1
					post.human_downvotes -= 1
				elsif vote.to_i === 1
					post.upvotes -= 1
					post.human_upvotes -= 1
				end
				user["#{type}_votes"] = user["#{type}_votes"].except(post.uuid)
				user.votes_count -= 1
				vote = nil
				same = true
			end

			votes_ip_hash = post.votes_ip

			if post.votes.key?(user.uuid) && !same
				#remove vote, then add new one.
				post.votes = post.votes.except(user.uuid)
				post.human_votes = post.human_votes.except(user.uuid)
				votes_hash = post.votes
				votes_hash[user.uuid] = vote
				post.votes = votes_hash
				human_votes_hash = post.human_votes
				human_votes_hash[user.uuid] = vote
				post.human_votes = human_votes_hash
				if(!votes_ip_hash.key?(request.remote_ip))
					votes_ip_hash[request.remote_ip] = 1
				end

				if vote.to_i === -1
					post.upvotes -= 1
					post.human_upvotes -= 1
					post.downvotes += 1
					post.human_downvotes += 1
				elsif vote.to_i === 1
					post.downvotes -= 1
					post.human_downvotes -= 1
					post.upvotes += 1
					post.human_upvotes += 1
				end

				user_votes_hash = user["#{type}_votes"]
				user_votes_hash[post.uuid.to_s] = vote
				user["#{type}_votes"] = user_votes_hash

			elsif !post.votes.key?(user.uuid) && !same
				if vote === 1
					post.upvotes += 1
					post.human_upvotes += 1
				elsif vote === -1
					post.downvotes +=1
					post.human_downvotes +=1
				end
				votes_hash = post.votes
				votes_hash[user.uuid] = vote
				if votes_ip_hash.key?(request.remote_ip)
					if votes_ip_hash[request.remote_ip] > 1
						puts 'i thinks i botz'
						# make the botter think that they successfully submitted it, but they didn't.
						render json:{}, status: :ok
						return false
					end
				else
					
				end

				human_votes_hash = post.human_votes
				human_votes_hash[user.uuid] = vote
				post.human_votes = human_votes_hash
				post.votes = votes_hash

				user_votes_hash = user["#{type}_votes"]
				user_votes_hash[post.uuid.to_s] = vote
				user["#{type}_votes"] = user_votes_hash

				post.votes_count += 1
				post.human_votes_count += 1
				user.votes_count += 1
			end
			post.average_vote = post.upvotes - post.downvotes
			post.voted = true
			user.average_vote = ((user.average_vote * user.votes_count) + vote.to_i)/(user.votes_count + 1)

			if post.save && user.save
				puts 'saved and sending'
				#RankWorker.perform_async -- will modify later
				render json: {vote: post.average_vote, user_vote: vote, upvotes:post.upvotes,downvotes:post.downvotes,votes_count:post.votes_count}, status: :ok
				id = type != 'comment' && type != 'reply' ? post.uuid : post.commentable_uuid
				type = type === 'reply' ? 'comment' : type
				PurgecacheWorker.perform_async(type,id,post.post_type)
				if same then vote = og_vote.to_i === 1 ? -1 : 1 end
				KarmaWorker.perform_async(type,post.as_json,vote)
			else
				render json: {}, status: :internal_server_error
			end
		else
			render json: {}, status: :unauthorized
		end
	end

end
