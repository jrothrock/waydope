class SongdeleteWorker
	include Sidekiq::Worker
	def perform
		songs = Song.where('in_deletion = true').all
		songs.each do |song|
			userids = song.likes.keys
			if userids
				userids.each do |userid|
					user = User.where('UUID = ?', userid).last
					user.songs = user.songs.except(song.uuid)
					user.save
				end
			end
			category = MusicGenre.where("url = ?",song.main_genre).first
			if category
				category.count -= 1
				### Again, may want to change the include? to hash or set. 
				if category.top_day.include?(song.uuid) then category.top_day -= [song.uuid]	end
				if category.top_week.include?(song.uuid) then category.top_week -= [song.uuid] end
				if category.top_month.include?(song.uuid) then category.top_month -= [song.uuid] end
				if category.top_year.include?(song.uuid) then category.top_year -= [song.uuid] end
				if category.top_alltime.include?(song.uuid) then category.top_alltime -= [song.uuid] end
				category.save
			end
			song.in_deletion = false
			if song.deleted
				if song.form == 1
					Song.removeDir(song)		
					Song.deleteAmazon(song)
				end
				song.delete
			else
				song.save
			end
		end
	end
end
