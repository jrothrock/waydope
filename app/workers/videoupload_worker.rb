class VideouploadWorker
	include Sidekiq::Worker
	def perform
		videos = Video.where('uploaded = true AND worked = false AND form = 1').all

		key = Rails.application.secrets.aws_access_key_id
		secret =  Rails.application.secrets.aws_secret_access_key
		credentials = Aws::Credentials.new(key, secret)
		s3 = Aws::S3::Resource.new(region: 'us-west-2', credentials: credentials)
		

		videos.each do |video|
			
			name_parts = video.link.split('/').last.split('.') # split the url to get the video name then split it by name and extension - ie ["video", "mp3"]

			obj = s3.bucket(Rails.application.secrets.aws_bucket).object(video.link)
			unless File.directory?("#{Rails.root}/public/#{video.video.store_dir}")
				FileUtils.mkdir_p("#{Rails.root}/public/#{video.video.store_dir}")
			end

			Dir.chdir("#{Rails.root}/public/#{video.video.store_dir}")
			path = "#{Rails.root}/public/#{video.video.store_dir}/#{name_parts[0]}.#{name_parts[1]}"
			obj.get(response_target: path)
			
			length = Video.transcode(video,path,name_parts[0])
			Video.uploadVideo(video,name_parts[0],s3,length)
			Video.removeDir(video)
			Video.purge_cache
			NotificationuploadWorker.perform_async(video.as_json)
		end
	end
end
