class Api::V1::Admin::MessagesController < ApplicationController
	def index #all songs
		if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)

			if user && user.admin
				render json: {messages: Message.all.order('created_at DESC')}, status: :ok
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

			message = Message.find(request.headers["id"])
			message.read = true
			if message.save
				render json: {message: message}, status: :ok
			else
				render json: {}, status: :not_found
			end
		else
			render json: {}, status: :forbidden
		end
	end

end
