require 'pismo'
class TrackuserWorker
    include Sidekiq::Worker
	def perform(id,auth,controller,remote_ip,referer)
        puts 'in tracker worker'
        puts id
		if Tracker.trackURL(controller)
            values = $redis.hvals("tracker_#{id}")
            views = values[0].to_i + 1
            $redis.hset("tracker_#{id}","views",views)
            value = $redis.hget("tracker_#{id}_referers",referer)
            count = value ? value : 1
            $redis.hset("tracker_#{id}_referers",referer,count)
            # if $redis.get("tracker_#{id}_stale").to_i < (Time.now.to_i - 3.hours)
            #     $redis.set("tracker_#{id}_stale", Time.now.to_i)
            #     $redis.set("tracker_#{id}_duration", Time.now.to_i)
            #     # if $redis.
            # end
        end
        # case controller
	end
end
