require "#{Rails.root}/app/uploaders/artwork_uploader"
require 'carrierwave'
require 'taglib'
require 'open-uri'
class ProductphotodeleteWorker
	include Sidekiq::Worker
	def perform(url)
		key = Rails.application.secrets.aws_access_key_id
		secret =  Rails.application.secrets.aws_secret_access_key
		credentials = Aws::Credentials.new(key, secret)
		s3 = Aws::S3::Resource.new(region: 'us-west-2', credentials: credentials)
		bucket = Rails.application.secrets.aws_bucket

		photo = s3.bucket(bucket).object("#{url.split('.com/')[1]}")
		photo.delete	
	end
end