class VideoembedWorker
	include Sidekiq::Worker
	def perform
		videos = Video.where('worked = false AND form = 0').all
		videos.each do |video|
			link = video.original_link
			embeds = Video.embed(link,video)
			video.link = embeds[0]
			video.link_artwork = embeds[1]
			video.post_link = embeds[2]
			video.worked = true
			# if video.artwork
				# video.artwork_url = Video.uploadEmbededPhoto(video)
			# end
			video.save
			PurgecacheWorker.perform_async(video.post_type,video.uuid,'upload')
			NotificationuploadWorker.perform_async(video.as_json)
		end
	end
end