class Api::V1::Users::Seller::SsnController < ApplicationController
    def update
        if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)
		end
        if user 
            # begin 
            if user.seller && user.stripe_id
                    Stripe.api_key =  Rails.application.secrets.stripe
                    acct=Stripe::Account.retrieve(user.stripe_id)
                    acct.legal_entity.ssn_last_4 = params[:ssn].split('-').last
                    acct.legal_entity.personal_id_number = params[:ssn].split('-').join()
                    acct.save
                    if acct.verification.fields_needed.length
                        ExceptionNotifier.notify_exception(acct.verification.fields_needed,
                                                    :env => request.env, :data => {:message => "Unknown fields have been requested by the yung stripe."})
                    end
                    user.ssn_uploaded = true
                    user.ssn_required = false
                    user.save
                # rescue => e 
                #         puts e.backtrace
                #         ExceptionNotifier.notify_exception(e,
                #                 :env => request.env, :data => {:message => "Something failed while updating the SSN: #{e.inspect}, #{e.backtrace}"})
                #         render json:{status:500, success:false, message:"Something failed in the SSN update"}
                #         return false
                # end
                render json:{status:200, success:true}
            else
                render json:{status:401, success:false, message:"You need to have signed up as a seller, and have filled out the info in the seller modal."}
            end
		else
			render json:{status:401, sucess:false, message:"No user found"}
		end
    end

end