class Api::V1::Contact::MessagesController < ApplicationController
	def create
		
		message = Message.new
		
		if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)

			if user
				message.submitted_by = user.username
			end
		end
		
		message.title = params[:title]
		message.body = params[:body]
		message.email = params[:email]
		message.preview = message.body[0..50] + '...'
		message.category = params[:category]
		message.read = false
		if message.save!
			render json: {status:200, success:true}
		else
			render json: {status:500, success:false}
		end

	end
end
