class Api::V1::Partners::ApplicationController < ApplicationController
	def create
		
		partner = Partner.new
		
		if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)

			if user
				partner.submitted_by = user.username
			end
		end
		
		partner.name = params[:name]
		partner.email = params[:email]
		partner.contact_name = params[:contact_name]
		partner.phone = params[:phone]
		partner.website = params[:website]
		partner.information = params[:information]
		partner.read = false
		partner.accepted = false
		if partner.save!
			render json: {}, status: :ok
		else
			render json: {}, status: :internal_server_error
		end

	end
end
