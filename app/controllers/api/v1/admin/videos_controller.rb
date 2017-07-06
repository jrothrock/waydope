class Api::V1::Admin::VideosController < ApplicationController
	def index #all songs
		if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)

			if user && user.admin
				render json: {status: 200, success: true, videos: Video.all.order('created_at DESC')}
			else
				render json: {status: 403, success:false}
			end
		else
			render json: {status: 403, success:false}
		end
	end

	def read #get individual user
		if request.headers["Authorization"]
			admin = User.find_by_token(request.headers["Authorization"].split(' ').last)
			if !admin || !admin.admin
				render json: {status: 403, success:false}
				return
			end

			video = Video.find(request.headers["id"])
			if video
				render json: {status: 200, success: true, video: video}
			else
				render json: {status: 404, success: false}
			end
		else
			render json: {status:403, success: false}
		end
	end

	def update
		if request.headers["Authorization"]
			admin = User.find_by_token(request.headers["Authorization"].split(' ').last)
			if !admin || !admin.admin
				render json: {status: 403, success:false}
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
					render json: {status: 200, success:true}
				else
					render json: {status: 500, success:false}
				end
			else
				render json: {status: 404, success:false}
			end
		else 
			render json: {status: 403, success:false}
		end
	end
end
