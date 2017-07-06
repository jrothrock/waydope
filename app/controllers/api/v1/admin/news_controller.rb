class Api::V1::Admin::NewsController < ApplicationController
	def index #all songs
		if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)

			if user && user.admin
				render json: {status: 200, success: true, news: NewsPost.all.order('created_at DESC')}
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

			post = NewsPost.find(request.headers["id"])
			if post
				render json: {status: 200, success: true, post: post}
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

			post = NewsPost.find(params[:id])
			if post

				post.title = params[:title]
				post.category = params[:category]
				post.link = params[:link]
				post.url = params[:title].parameterize
				post.description = params[:description]
				
				if post.save
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
