class Api::V1::Users::Actions::ResetController < ApplicationController
    def create
        puts params[:username]
        user = User.where("username = ?", params[:username]).first
        if user
            if user.email
                if User.resetPassword(user)
                    # puts reset.raw_source
                    # puts 'body'
                    # puts reset.body
                    render json:{status:200, success:true}
                else 
                    render json:{status:500, success:false}
                end
            else
                render json:{status:401, success:false, no_email:true}
            end
        else
            render json:{status:404, success:false, no_user:true}
        end
    end
    def update
        user = User.where("reset_password_token = ?", params[:token]).first
        if user && user.reset_password_sent_at > 15.minutes.ago
            if params[:password] && params[:confirmPassword] && params[:password] === params[:confirmPassword]
                user.password = params[:password]
                user.reset_password_sent_at = nil
                user.reset_password_token = nil
                if user.save
                    render json:{status:200, success:true}
                else
                    render json:{status:500, success:false}
                end
            else
                render json:{status:400, success:false, password:true, message:'need to include password and confirmPassword params'}
            end
        else
            render json:{status:404, success:false}
        end
    end
end
