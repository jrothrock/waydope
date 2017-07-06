class Api::V1::Users::Seller::PaypalController < ApplicationController
	def read
		if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)
		end
		if user
			render json:{status:200, success:true, has_paypal:user.has_paypal}
		else
			render json:{status:401, sucess:false}
		end
	end

    def update
        if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)
		end
        if user && params[:code]
            user.has_paypal = true
            user.info_stage = 3
            if user.save
                return true
            else   
                render json:{status:500, success:false}
                Rails.logger.info(user.errors.inspect) 
            end
		else
			render json:{status:401, sucess:false}
		end
    end
end
