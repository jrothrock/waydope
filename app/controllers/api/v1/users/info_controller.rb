class Api::V1::Users::InfoController < ApplicationController
	def read
		if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)
		end
		if user
			render json:{status:200, success:true, email:user.email, address:user.address, address_two:user.address_two, zipcode: user.zip, firstname:user.firstname, lastname:user.lastname, phone_number:user.phone_number,city:user.city,state:user.state}
		else
			render json:{status:401, sucess:false}
		end
	end

    def update
        if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)
		end
        if user
            user.email = params[:email] ? params[:email] : user.email
            user.address = params[:address] ? params[:address] : user.address
			user.address_two = params[:address_two] ? params[:address_two] : user.address_two
            user.business_ein = params[:ein] ? params[:ein] : user.business_ein
            user.business_name = params[:business_name] ? params[:business_name] : user.business_name
            user.is_business = params[:is_business] ? params[:is_business] : user.is_business
            user.dob = params[:dob] ? params[:dob] : user.dob
            user.zip = params[:zip] ? params[:zip] : user.zip
            geo = params[:zip] ? Geokit::Geocoders::MultiGeocoder.geocode(params[:zip].to_s) : nil
            if geo && geo.success
                user.state = geo.state 
                user.city = geo.city 
                user.country = geo.country_code
            end
            if params[:password] then user.password = params[:password] end
            user.firstname = params[:firstname] ? params[:firstname] : user.firstname
            user.lastname = params[:lastname] ? params[:lastname] : user.lastname
            user.phone_number = params[:phone] ? params[:phone] : user.phone_number
            if user.save
                render json:{status:200, success:true}
            else   
                render json:{status:500, success:false}
                Rails.logger.info(user.errors.inspect) 
            end
		else
			render json:{status:401, sucess:false}
		end
    end
end
