class Api::V1::Users::Seller::VerificationController < ApplicationController
    def update
        if request.headers["Authorization"]
			user = User.find_by_token(request.headers["Authorization"].split(' ').last)
		end
        if user 
            key = Rails.application.secrets.aws_access_key_id
		    secret =  Rails.application.secrets.aws_secret_access_key
		    credentials = Aws::Credentials.new(key, secret)
		    s3 = Aws::S3::Resource.new(region: 'us-west-2', credentials: credentials)
            obj = s3.bucket(Rails.application.secrets.aws_bucket).object("uploads/verification/#{user.uuid}/verification_#{user.uuid}.png")
            unless File.directory?("#{Rails.root}/public/uploads/verification/#{user.uuid}")
				FileUtils.mkdir_p("#{Rails.root}/public/uploads/verification/#{user.uuid}")
			end
            Dir.chdir("#{Rails.root}/public/uploads/verification/#{user.uuid}")
            obj.get(response_target: "#{Rails.root}/public/uploads/verification/#{user.uuid}/verification_#{user.uuid}.png")
            begin 
                Stripe.api_key =  Rails.application.secrets.stripe
                doc = Stripe::FileUpload.create(
                {
                    :purpose => 'identity_document',
                    :file => File.new("#{Rails.root}/public/uploads/verification/#{user.uuid}/verification_#{user.uuid}.png")
                },
                {:stripe_account => user.stripe_id})
                acct=Stripe::Account.retrieve(user.stripe_id)
                acct.legal_entity.verification.document = doc.id
                acct.save
                puts acct
                puts acct.verification.fields_needed.length
                puts acct.verification.fields_needed
                FileUtils.rm("#{Rails.root}/public/uploads/verification/#{user.uuid}/verification_#{user.uuid}.png")
                if acct.verification.fields_needed.length
                    ExceptionNotifier.notify_exception(acct.verification.fields_needed,
                                                :env => request.env, :data => {:message => "Unknown fields have been requested by the yung stripe."})
                end
            rescue => e 
                    ExceptionNotifier.notify_exception(e,
                            :env => request.env, :data => {:message => "Something failed in the stripe account creation: #{e.inspect}, #{e.backtrace}"})
                    render json:{status:500, success:false, message:"something failed in file upload"}
                    return false
            end
            render json:{status:200, success:true}
		else
			render json:{status:401, sucess:false}
		end
    end

end