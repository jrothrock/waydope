class Api::V1::Admin::ApplicationsController < ApplicationController
	def index #all songs
		user = request.headers["Authorization"] ?  User.find_by_token(request.headers["Authorization"].split(' ').last) : nil

		if user && user.admin
			render json: {status: 200, success: true, applications: Partner.where('read = false OR accepted = false').order('read DESC')}
		else
			render json:{status:403, success:false}
		end
	end

	def read 
		user = request.headers["Authorization"] ?  User.find_by_token(request.headers["Authorization"].split(' ').last) : nil

		if user && admin.admin

			application = Partner.find(request.headers["id"])
			application.read = true
			if application.save
				render json: {status: 200, success: true, application: application}
			else
				render json: {status: 404, success: false}
			end
		else
			render json:{status:403, success:false}
		end
	end

	def update
		user = request.headers["Authorization"] ?  User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
		if user && admin.admin
			application = Partner.find(request.headers["id"])
			application.accepted = true
			if application.save
				render json: {status: 200, success: true}
			else
				render json: {status: 404, success: false}
			end
		else
			render json:{status:403, success:false}
		end
	end
end
