require "#{Rails.root}/app/uploaders/artwork_uploader"
require 'carrierwave'
require 'taglib'
require 'open-uri'
class SongphotoWorker
	include Sidekiq::Worker
	def perform(id)
		song = Song.find_by_id(id)

		key = Rails.application.secrets.aws_access_key_id
		secret =  Rails.application.secrets.aws_secret_access_key
		credentials = Aws::Credentials.new(key, secret)
		s3 = Aws::S3::Resource.new(region: 'us-west-2', credentials: credentials)

        Song.uploadPhoto(song,s3)
	end
end