class Api::V1::Admin::PartnersController < ApplicationController
	def index #all songs
		if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)

			if user && user.admin
				render json: {partners: Partner.where('accepted = true')}, status: :ok
			else
				render json: {}, status: :forbidden
			end
		else
			render json: {}, status: :forbidden
		end
	end

	def read 
		if request.headers["Authorization"]
			admin = User.find_by_token(request.headers["Authorization"].split(' ').last)
			if !admin || !admin.admin
				render json: {}, status: :forbidden
				return
			end

			partner = Partner.find(request.headers["id"])
			if partner.save
				render json: {partner: partner}, status: :ok
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

			partner = Partner.find(request.headers["id"])
			partner.accepted = false
			if partner.save
				render json: {}, status: :ok
			else
				render json: {}, status: :not_found
			end
		else
			render json: {}, status: :forbidden
		end
	end
end
