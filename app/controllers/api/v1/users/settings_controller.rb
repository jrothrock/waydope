class Api::V1::Users::SettingsController < ApplicationController
	def read
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
		if user
			render json:{success:true, email:user.email, address:user.address, address_two:user.address_two, zipcode: user.zip, firstname:user.firstname, lastname:user.lastname, phone_number:user.phone_number,city:user.city,state:user.state,show_nsfw:user.show_nsfw,hide_nsfw:user.hide_nsfw}, status: :ok
		else
			render json:{sucess:false}, status: :unauthorized
		end
	end

    def update
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user
            type = params[:type]
            if type
                if type === 'info'
                    user.email = params[:email] ? params[:email] : user.email
                    user.address = params[:address] ? params[:address] : user.address
                    user.address_two = params[:address_two] ? params[:address_two] : user.address_two
                    user.zip = params[:zipcode] ? params[:zipcode] : user.zip
                    geo = params[:zipcode] && params[:zipcode] != "" ? Geokit::Geocoders::MultiGeocoder.geocode(params[:zipcode].to_s) : nil
                    if geo && geo.success
                        user.state = geo.state 
                        user.city = geo.city 
                    elsif((!user.zip || user.zip == "") && (user.state || user.city))
                        user.state = ""
                        user.city = ""
                    end
                    user.firstname = params[:firstname] ? params[:firstname] : user.firstname
                    user.lastname = params[:lastname] ? params[:lastname] : user.lastname
                    user.phone_number = params[:phone_number] ? params[:phone_number] : user.phone_number
                    if user.save
                        render json:{success:true}, status: :ok
                    else   
                        render json:{success:false}, status: :internal_server_error
                        Rails.logger.info(user.errors.inspect) 
                    end
                elsif type === 'options'
                    user.show_nsfw = params[:show_nsfw] ? params[:show_nsfw] : user.show_nsfw
                    user.hide_nsfw = params[:hide_nsfw] ? params[:hide_nsfw] : user.hide_nsfw
                    if user.save
                        render json:{status:200, success:true}
                    else   
                        render json:{success:false}, status: :internal_server_error
                        Rails.logger.info(user.errors.inspect) 
                    end
                elsif type === 'password'
                    if user.password == params[:current_password]
                        if params[:password]
                            user.password = params[:password]
                            if user.save
                                render json:{status:200, success:true}
                            else   
                                render json:{success:false}, status: :internal_server_error
                                Rails.logger.info(user.errors.inspect) 
                            end
                        else
                            render json:{status:400, success:false, message:"password parameter is required"}
                        end
                    else
                        render json:{status:400, success:false, password:true, message:"password does not match current password"}
                    end
                else
                    render json:{status:400, success:false, message:'type parameter needs to be one of the following: (info, options,password)'}
                end
            else
                render json:{status:400, success:false, message:"type parameter is requried (info,options,password"}
            end
		else
			render json:{sucess:false}, status: :unauthorized
		end
    end
end
