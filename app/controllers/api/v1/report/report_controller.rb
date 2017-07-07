class Api::V1::Report::ReportController < ApplicationController
	def create
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
		if user 
			type = params[:type]
			puts type

			if type === 'music'
				post = Song.where("uuid = ?", params[:id]).first
			elsif type === 'videos'
				post = Video.where("uuid = ?", params[:id]).first
			elsif type === 'news'
				post = NewsPost.where("uuid = ?", params[:id]).first
				#userType = user.news_posts
			elsif type === 'comment'
				post = Comment.where("uuid = ?", params[:id]).first
			elsif type === 'reply'
				post = Reply.where("uuid = ?", params[:id]).first
			end

			if !post 
				render json:{}, status: :not_found
				return false
			end

			if(!post.reported) 
				 post.reported = true
				 post.report_created = Time.now
			end
			post.report_types << params[:foul]
			post.report_users << user.uuid
			post.report_count += 1

			user.reports << post.uuid
			user.report_types << type
			user.report_fouls << params[:foul]

			if post.save && user.save
				render json:{}, status: :ok
			else
				render json:{}, status: :internal_server_error
				Rails.logger.info(post.errors.inspect) 
				Rails.logger.info(user.errors.inspect) 
			end
		else
			render json:{}, status: :unauthroized
		end
	end
end
