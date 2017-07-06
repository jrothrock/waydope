class Api::V1::Auth::Admin::SessionsAdminController < ApplicationController
	def new
		user = User.find_by_token(request.headers["Authorization"].split(' ').last)
		puts 'checked if admin'
		if user && user.admin
			render json: {status: 200, success: true}
		else 
			render json: {status:401, success:false}
		end
	end
end
