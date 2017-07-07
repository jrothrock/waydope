class Api::V1::Admin::ApplicationsController < ApplicationController
	def index #all songs
		user = request.headers["Authorization"] ?  User.find_by_token(request.headers["Authorization"].split(' ').last) : nil

		if user && user.admin
			render json: {applications: Partner.where('read = false OR accepted = false').order('read DESC')}, status: :ok
		else
			render json:{}, status: :forbidden
		end
	end

	def read 
		user = request.headers["Authorization"] ?  User.find_by_token(request.headers["Authorization"].split(' ').last) : nil

		if user && admin.admin

			application = Partner.find(request.headers["id"])
			application.read = true
			if application.save
				render json: {application: application}, status: :ok
			else
				render json: {}, status: :not_found
			end
		else
			render json:{}, status: :forbidden
		end
	end

	def update
		user = request.headers["Authorization"] ?  User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
		if user && admin.admin
			application = Partner.find(request.headers["id"])
			application.accepted = true
			if application.save
				render json: {}, status: :ok
			else
				render json: {}, status: :not_found
			end
		else
			render json:{}, status: :forbidden
		end
	end
end
