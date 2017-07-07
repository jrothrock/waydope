class Api::V1::Admin::VideosController < ApplicationController
	def index #all songs
		if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)

			if user && user.admin
				render json: {videos: Video.all.order('created_at DESC')}, status: :ok
			else
				render json: {}, status: :forbidden
			end
		else
			render json: {}, status: :forbidden
		end
	end

	def read #get individual user
		if request.headers["Authorization"]
			admin = User.find_by_token(request.headers["Authorization"].split(' ').last)
			if !admin || !admin.admin
				render json: {}, status: :forbidden
				return
			end

			video = Video.find(request.headers["id"])
			if video
				render json: {video: video}, status: :ok
			else
				render json: {}, status: :not_found
			end
		else
			render json: {}, status: :forbidden
		end
	end

	def update
		if request.headers["Authorization"]
			admin = User.find_by_token(request.headers["Authorization"].split(' ').last)
			if !admin || !admin.admin
				render json: {}, status: :forbidden
				return
			end

			video = Video.find(params[:id])
			if video

				video.title = params[:title]
				video.category = params[:category]
				video.link = params[:link]
				video.url = params[:title].parameterize
				video.description = params[:description]
				
				if video.save
					render json: {}, status: :ok
				else
					render json: {}, status: :internal_server_error
				end
			else
				render json: {}, status: :not_found
			end
		else 
			render json: {}, status: :forbidden
		end
	end
end
