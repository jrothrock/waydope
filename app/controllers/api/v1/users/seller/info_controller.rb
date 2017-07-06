class Api::V1::Users::Seller::InfoController < ApplicationController
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
            if !params[:email] || !params[:address] || !params[:dob] || !params[:zip] || !params[:firstname] || !params[:lastname] || !params[:phone]
                render json:{status:400, success:false, message:"not all parameters were passed in."}
                return false
            end
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
            user.firstname = params[:firstname] ? params[:firstname] : user.firstname
            user.lastname = params[:lastname] ? params[:lastname] : user.lastname
            user.phone_number = params[:phone] ? params[:phone] : user.phone_number
            if !user.stripe_id || user.stripe_id === ''
                retry_count = 0
                Stripe.api_key =  Rails.application.secrets.stripe
                begin
                    acct = Stripe::Account.create(
                    {
                        :country => 'US',
                        :managed => true,
                        :tos_acceptance => {
                        :date => Time.now.to_i,
                        :ip => request.remote_ip,
                        },
                        :legal_entity =>{
                            :address =>{
                                city:user.city,
                                line1:user.address,
                                country:user.country,
                                postal_code: user.zip,
                                state: user.state
                            },
                            business_name:user.business_name,
                            business_tax_id:user.business_ein,
                            dob:{
                                day:user.dob.strftime("%d"),
                                month:user.dob.strftime("%m"),
                                year:user.dob.strftime("%Y")
                            },
                            first_name:user.firstname,
                            last_name:user.lastname,
                            type:user.is_business ? 'company' : 'individual',
                            phone_number:user.phone_number
                        }
                    }
                    )
                rescue => e
                    if retry_count < 1
                        ExceptionNotifier.notify_exception(e,
                            :env => request.env, :data => {:message => "Something failed in the stripe account creation: #{e.inspect}, #{e.backtrace}"})
                        Rails.logger.info(e)
                        retry_count += 1
                        retry
                    else
                        render json:{status:400, success:false, message:"stripe failed to create the account"}
                        return false
                    end
                end
            end
            if acct && acct.id
                user.stripe_id = acct.id
            end
            if user.save
                if user.country === 'US'
                    render json:{status:200, success:true,verification_document:false}
                else
                    render json:{status:200, success:false,country:true,verification_document:false}
                end
            else   
                render json:{status:500, success:false}
                Rails.logger.info(user.errors.inspect) 
            end
		else
			render json:{status:401, sucess:false}
		end
    end

end
