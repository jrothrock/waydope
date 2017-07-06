require "#{Rails.root}/app/uploaders/song_uploader"
require 'carrierwave'
class SongembedWorker
	include Sidekiq::Worker
	# @queue = :soundcloud
	def perform
		songs = Song.where('worked = false AND form = 0').all
		songs.each do |song|
			link = song.original_link
			embeds = Song.embed(link)
			song.link = embeds[0]
			song.link_artwork = embeds[1]
			song.post_link = embeds[2]
			song.worked = true
			song.save
			PurgecacheWorker.perform_async(song.post_type,song.uuid,'upload')
			NotificationuploadWorker.perform_async(song.as_json)
		end
	end
end
