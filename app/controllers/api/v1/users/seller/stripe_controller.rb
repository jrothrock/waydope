class Api::V1::Users::Seller::StripeController < ApplicationController
    def update
        if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)
		end
        if user 
            if !params[:token]
                render json:{status:400, success:false, message:"Token is required"}
                return false
            end
            puts 'stripe id'
            puts user.stripe_id
            if user.info_stage < 2
                retry_count = 0
                Stripe.api_key =  Rails.application.secrets.stripe
                begin
                    acct=Stripe::Account.retrieve(user.stripe_id)
                    acct.external_account = params[:token]
                    acct.save
                rescue => e
                    if retry_count < 1
                        ExceptionNotifier.notify_exception(e,
                            :env => request.env, :data => {:message => "Something failed in the stripe account creation: #{e.inspect}, #{e.backtrace}"})
                        puts e.inspect.split(')').last.gsub('>','').strip
                        if e.inspect.split(')').last.gsub('>','').strip === "This card doesn't appear to be a debit card."
                            render json:{status:400, success:false, credit_card:true}
                            return false
                        end
                        Rails.logger.info(e)
                        retry_count += 1
                        retry
                    else
                        render json:{status:400, success:false, message:"stripe failed to create the account"}
                        return false
                    end
                end
                puts acct
                puts acct.verification.fields_needed.length
                puts acct.verification.fields_needed
                if acct.verification.fields_needed.length && acct.verification.fields_needed.include?("legal_entity.verification.document")
                    verification_document = true
                	string_to_sign
					render :json => {
						:policy => @policy,
						:signature => sig,
						:key => Rails.application.secrets.aws_access_key_id,
						:success=>true,
						:store=> "uploads/verification/#{user.uuid}",
						:time => @time_policy,
						:time_date => @date_stamp,
						:user_id => user.uuid,
                        status:200,
                        success:true,
                        verification_document:verification_document
					}
                    return true
                elsif acct.verification.fields_needed.length
                    ExceptionNotifier.notify_exception(acct.verification.fields_needed,
                                                :env => request.env, :data => {:message => "Unknown fields have been requested by the yung stripe."})
                end
                user.info_stage = user.info_stage != 3 ? 2 : 3
            end
            if user.save
                render json:{status:200, success:true, verification_document:verification_document}
            else
                render json:{status:500, success:false}
                Rails.logger.info(user.errors.inspect) 
            end
		else
			render json:{status:401, sucess:false}
		end
    end

    private

	def string_to_sign
		
		@time = Time.now.utc
		@time_policy = @time.strftime('%Y%m%dT000000Z')
		@date_stamp = @time.strftime('%Y%m%d')

		 ret = {"expiration" => 10.hours.from_now.utc.iso8601,
				"conditions" =>  [
					{"bucket" => Rails.application.secrets.aws_bucket},
					{"x-amz-credential": "#{Rails.application.secrets.aws_access_key_id}/#{@date_stamp}/us-west-2/s3/aws4_request"},
					{"x-amz-algorithm": "AWS4-HMAC-SHA256"},
					{"x-amz-date": @time_policy },
					["starts-with", "$key", "uploads"], 
					["content-length-range", 0, 2147483648]
				]
			}

		@policy = Base64.encode64(ret.to_json).gsub(/\n|\r/, '')

	end

	def getSignatureKey
		kDate = OpenSSL::HMAC.digest('sha256', ("AWS4" +  Rails.application.secrets.aws_secret_access_key), @date_stamp)
		kRegion = OpenSSL::HMAC.digest('sha256', kDate, 'us-west-2')
		kService = OpenSSL::HMAC.digest('sha256', kRegion, 's3')
		kSigning = OpenSSL::HMAC.digest('sha256', kService, "aws4_request")
	end

	def sig
		# sig = Base64.encode64(OpenSSL::HMAC.digest('sha256', getSignatureKey,  @policy)).gsub(/\n|\r/, '')
		sig = OpenSSL::HMAC.hexdigest(OpenSSL::Digest.new('sha256'), getSignatureKey, @policy).gsub(/\n|\r/, '')
	end
end