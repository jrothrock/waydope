class Api::V1::Admin::Bots::UsersController < ApplicationController
    def create
        user = request.headers["Authorization"] ?  User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user && user.admin
            names = Bot.getNames(params[:count].to_i)
            users=[]
            names.each_with_index do |(key,value),index|
                attrs = {username: key, human: false, login_username: key.downcase, password:SecureRandom.hex(15), uuid: User.setUUID, last_duration:0}
                user = User.new(attrs)
                user.save
                users.push(user)
            end
            render json:{users: users}, status: :ok
        else
            render json:{}, status: :forbidden
        end
    end

    def update
        user = request.headers["Authorization"] ?  User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user && user.admin
            user_to_update = User.where("uuid = ?", params[:id]).first
            if user_to_update
                if !User.where("username = ? OR login_username = ?", params[:username].strip(),params[:username].downcase.strip()).exists?
                    user_to_update.username = params[:username].strip()
                    user_to_update.gender = params[:gender] ? params[:gender] : ''
                    user_to_update.login_username = params[:username].downcase.strip()
                    if user_to_update.save
                        render json:{}, status: :ok
                    else
                        render json:{}, status: :bad_request
                    end
                else
                    render json:{smessage:"this username has been taken"}, status: :conflict
                end
            else
                render json:{}, status: :not_found
            end
        else
            render json:{}, status: :forbidden
        end

    end
end
