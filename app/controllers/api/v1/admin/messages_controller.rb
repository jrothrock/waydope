class Api::V1::Admin::MessagesController < ApplicationController
	def index #all songs
		if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)

			if user && user.admin
				render json: {status: 200, success: true, messages: Message.all.order('created_at DESC')}
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

			message = Message.find(request.headers["id"])
			message.read = true
			if message.save
				render json: {status: 200, success: true, message: message}
			else
				render json: {status: 404, success: false}
			end
		else
			render json: {status:403, success: false}
		end
	end

end
