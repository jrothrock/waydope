class SongdownloadWorker
	include Sidekiq::Worker
	def perform(id,user_id,remote_ip,type)
        song = Song.where("uuid = ?", id).first
        user = User.find_by_id(user_id)
		song.download_count += 1
        if type === 'direct'
            song.direct_download_count += 1
        else
            song.link_download_count += 1
        end
        if user
            users = song.download_users
            count = users.key?(user.uuid) ? users[user.uuid].to_i + 1 : 1
            users[user.uuid] = count
            song.download_users = users
        end
        ips = song.download_ips
        count = ips.key?(remote_ip) ? ips[remote_ip].to_i + 1 : 1
        ips[remote_ip] = count
        song.download_ips = ips
        
        song.save
        if user
            downloads = user.song_downloads
            count = downloads.key?(song.uuid) ? downloads[song.uuid].to_i + 1 : 1
            downloads[song.uuid] = count
            user.song_downloads = downloads
            user.save
        end
	end
end