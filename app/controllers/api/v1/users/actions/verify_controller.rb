class Api::V1::Users::Actions::VerifyController < ApplicationController
    def update
        user = User.where("email_token = ?", params[:token]).first
        if user && user.email_time_stamp > 30.minutes.ago
            user.verified_email = true
            user.email_token = nil
            if user.save
                render json:{status:200, success:true}
            else
                render json:{status:500, success:false}
            end
        else
            render json:{status:404, success:false}
        end
    end
end
