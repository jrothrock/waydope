class Api::V1::Admin::NewsController < ApplicationController
	def index #all songs
		if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)

			if user && user.admin
				render json: {news: NewsPost.all.order('created_at DESC')}, status: :ok
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

			post = NewsPost.find(request.headers["id"])
			if post
				render json: {post: post}, status: :ok
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

			post = NewsPost.find(params[:id])
			if post

				post.title = params[:title]
				post.category = params[:category]
				post.link = params[:link]
				post.url = params[:title].parameterize
				post.description = params[:description]
				
				if post.save
					render json: {}, status: :ok
				else
					render json: {}, status: :internal_server_erro
				end
			else
				render json: {}, status: :not_found
			end

		else 
			render json: {}, status: :forbidden
		end
	end
end
