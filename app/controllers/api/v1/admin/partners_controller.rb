class Api::V1::Admin::PartnersController < ApplicationController
	def index #all songs
		if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)

			if user && user.admin
				render json: {status: 200, success: true, partners: Partner.where('accepted = true')}
			else
				render json: {status: 403, success:false}
			end
		else
			render json: {status: 403, success:false}
		end
	end

	def read 
		if request.headers["Authorization"]
			admin = User.find_by_token(request.headers["Authorization"].split(' ').last)
			if !admin || !admin.admin
				render json: {status: 403, success:false}
				return
			end

			partner = Partner.find(request.headers["id"])
			if partner.save
				render json: {status: 200, success: true, partner: partner}
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

			partner = Partner.find(request.headers["id"])
			partner.accepted = false
			if partner.save
				render json: {status: 200, success: true}
			else
				render json: {status: 404, success: false}
			end
		else
			render json: {status:403, success: false}
		end
	end
end
