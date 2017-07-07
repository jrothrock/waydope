require 'fuzzystringmatch'
class Api::V1::Music::DownloadController < ApplicationController
	def create
		 user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
         song = Song.where("genre = ? AND url = ?", params[:genre], params[:song]).first
		 puts song.upload_url.split(".com/")[1]
         if song
			if song.form === 1
				if song.download === 1 && song.store_url
					key = Rails.application.secrets.aws_access_key_id
					secret =  Rails.application.secrets.aws_secret_access_key
					credentials = Aws::Credentials.new(key, secret)
					s3 = Aws::S3::Resource.new(region: 'us-west-2', credentials: credentials)
					client = Aws::S3::Client.new(
						region: "us-west-2",
						credentials: credentials
					)
					signer = Aws::S3::Presigner.new(:client=>client)
					url = signer.presigned_url(:get_object, response_content_disposition:"attachment; filename=#{song.file_name.gsub('"','')}", bucket: Rails.application.secrets.aws_bucket, key: song.store_url,:expires_in=>600)
					render json:{url:url}, status: :ok
					SongdownloadWorker.perform_async(song.uuid,user.id,request.remote_ip,'direct')
				elsif song.download === 2
					SongdownloadWorker.perform_async(song.uuid,user.id,request.remote_ip,'link')
					render json:{}, status: :ok
				else
					render json:{message:"Song does not allow downloading"}, status: :unprocessable_entity
				end
            else
                render json:{message:"Song, has not been uploaded. Therefore, there is no media to download"}, status: :unprocessable_entity
            end
        else
            render json:{message:"need song param - id of the song"}, status: :bad_request
        end
	end
	
end
