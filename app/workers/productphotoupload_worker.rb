require "#{Rails.root}/app/uploaders/artwork_uploader"
require 'carrierwave'
require 'taglib'
require 'open-uri'
class ProductphotouploadWorker
	include Sidekiq::Worker
	def perform(id)
        puts id
		product = Product.find_by_id(id)

        photo_ids = product.photos.map {|photo| photo.uuid}
		puts 'ids'
		puts photo_ids
        upload_ids = product.upload_urls.map {|url| url.split('photo')[2].split('/')[4]}
		puts 'upload ids'
		puts upload_ids
        not_uploaded = photo_ids.keep_if {|id| !upload_ids.include?(id.to_s)}
		puts 'not uploaded'
		puts not_uploaded

		key = Rails.application.secrets.aws_access_key_id
		secret =  Rails.application.secrets.aws_secret_access_key
		credentials = Aws::Credentials.new(key, secret)
		s3 = Aws::S3::Resource.new(region: 'us-west-2', credentials: credentials)

        Product.uploadPhoto(product,not_uploaded,s3)
	end
end