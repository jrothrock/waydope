class VideodeleteWorker
	include Sidekiq::Worker
	def perform
		videos = Video.where('in_deletion = true').all
		videos.each do |video|
			userids = video.likes.keys
			if userids
				userids.each do |userid|
					user = User.where('UUID = ?', userid).last
					user.videos = user.videos.except(video.uuid)
					user.save
				end
			end
			category = VideoCategory.where("url = ?",video.main_category).first
			if category
				category.count -= 1
				### Again, may want to change the include? to hash or set. 
				if category.top_day.include?(video.uuid) then category.top_day -= [video.uuid]	end
				if category.top_week.include?(video.uuid) then category.top_week -= [video.uuid] end
				if category.top_month.include?(video.uuid) then category.top_month -= [video.uuid] end
				if category.top_year.include?(video.uuid) then category.top_year -= [video.uuid] end
				if category.top_alltime.include?(video.uuid) then category.top_alltime -= [video.uuid] end
				category.save
			end
			video.in_deletion = false
			if video.deleted
				if video.form == 1
					Video.removeDir(video)
					Video.deleteAmazon(video)
				end
				video.delete
			else
				video.save
			end
		end
		if videos.length
			Video.purge_cache
		end
	end
end
