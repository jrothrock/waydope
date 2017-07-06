class UpdatetrackerWorker
	include Sidekiq::Worker
	def perform(authorization,signature,user_agent)
        puts 'in update tracker'
        puts authorization
        puts signature
        user = authorization ? User.find_by_token(authorization.split(' ').last) : nil
        tracker = Tracker.where("uuid = ?", signature).first
        is_mobile = App.is_mobile(user_agent)
        if tracker
            tracker.last_visit = Time.now
            tracker_values = $redis.exists("tracker_#{tracker.uuid}") && $redis.hlen("tracker_#{tracker.uuid}") === 4 ? $redis.hvals("tracker_#{tracker.uuid}") : nil
            if tracker_values && tracker_values[0].to_i
                tracker.last_duration = (Time.now.to_i - tracker_values[0].to_i).to_i
                if tracker.durations
                    durations = tracker.durations
                    durations[Time.now.to_s] = tracker.last_duration
                    tracker.average_duration = (durations.values.sum/durations.keys.length).ceil
                    tracker.durations = durations
                else
                    tracker.durations = {Time.now.to_s => tracker.last_duration}
                    tracker.average_duration = tracker.last_duration
                end
            end
            if tracker_values && tracker_values[1]
                tracker.last_pageviews = tracker_values[1].to_i
                if tracker.pageviews
                    pageviews = tracker.pageviews
                    pageviews[Time.now] = tracker.last_pageviews
                    tracker.average_pageviews = (pageviews.values.sum/pageviews.keys.length)
                    tracker.pageviews = pageviews
                else
                    tracker.pageviews = {Time.now => views}
                    tracker.average_pageviews = views
                end
            end
            if tracker_values && tracker_values[3]
                tracker.referers
            end
            if !tracker.user_id && user
                tracker.user_id = user.id
            end
            if user
                if user.last_tracker != tracker.uuid
                    user.last_tracker = tracker.uuid
                end
                if !(user.trackers).key?(tracker.uuid)
                    trackers = user.trackers
                    trackers[tracker.uuid] = 1
                    user.trackers = trackers
                end
                if tracker_values[0].to_i
                    time = Time.now.to_i
                    user.last_duration = (time - tracker_values[0].to_i)
                    if user.durations && user.durations != '{}'
                        durations_hash = user.durations
                        durations_hash[Time.now.to_s] = (time - user.last_duration.to_i)
                        user.average_duration = (durations_hash.values.sum / durations_hash.keys.length)
                        user.durations = durations_hash
                    else
                        user.durations = {Time.now.to_s => (time - user.last_duration.to_i)}
                        user.average_duration = user.last_duration
                    end
                end
                if tracker_values[1].to_i
                    user.last_pageviews = tracker_values[1].to_i
                    if user.pageviews && user.pageviews != '{}'
                        pageviews_hash = user.pageviews
                        pageviews_hash[Time.now.to_s] = user.last_pageviews
                        user.average_pageviews = (pageviews_hash.values.sum / pageviews_hash.keys.length)
                        user.pageviews = pageviews_hash
                    else
                        user.pageviews = {Time.now.to_s => user.last_pageviews}
                        user.average_pageviews = user.last_pageviews
                    end
                end
                user.save
            end
            tracker.save
            impression = Impression.where('date = ?', Time.now.strftime("%Y%m%d")).first_or_create
            if tracker_values && tracker_values[1].to_i && tracker_values[1].to_i === 1
                impression.bounced = impression.bounced ? impression.bounced += 1 : 1
                if is_mobile
                    impression.bounced_mobile = impression.bounced_mobile ? impression.bounced_mobile += 1 : 0
                else
                    impression.bounced_non_mobile = impression.bounced_non_mobile ? impression.bounced_non_mobile += 1 : 0
                end
            end
            if tracker_values && tracker_values[0].to_i
                if impression.durations && impression.durations != '{}'
                    durations_hash = impression.durations
                    durations_hash[Time.now.to_s] = tracker_values[0].to_i
                    impression.average_duration = (durations_hash.values.sum / durations_hash.keys.length)
                    impression.durations = durations_hash
                else
                    impression.durations = {Time.now.to_s => tracker_values[0].to_i}
                    impression.average_duration = tracker_values[0].to_i
                end
                if is_mobile
                    if impression.durations_mobile && impression.durations_mobile != '{}'
                        durations_hash = impression.durations_mobile
                        durations_hash[Time.now.to_s] = tracker_values[0].to_i
                        impression.average_duration_mobile = (durations_hash.values.sum / durations_hash.keys.length)
                        impression.durations_mobile = durations_hash
                    else
                        impression.durations_mobile = {Time.now.to_s => tracker_values[0].to_i}
                        impression.average_duration_mobile = tracker_values[0].to_i
                    end
                else
                    if impression.durations_non_mobile && impression.durations_non_mobile != '{}'
                        durations_hash = impression.durations_non_mobile
                        durations_hash[Time.now.to_s] = tracker_values[0].to_i
                        impression.average_duration_non_mobile = (durations_hash.values.sum / durations_hash.keys.length)
                        impression.durations_non_mobile = durations_hash
                    else
                        impression.durations_non_mobile = {Time.now.to_s => tracker_values[0].to_i}
                        impression.average_duration_non_mobile = tracker_values[0].to_i
                    end
                end
            end
            if $redis.exists("tracker_#{tracker.uuid}_referers") && $redis.hlen("tracker_#{tracker.uuid}_referers") 
                # set the keys as the keys and values as the values
                referers = Hash[$redis.hkeys("tracker_#{tracker.uuid}_referers").zip $redis.hvals("tracker_#{tracker.uuid}_referers")]
                if impression.referers && impression.referers != '{}'
                    referers_hash = impression.referers
                    referers.each do |key, value|
                        if referers_hash.key?(key)
                            old_value = referers_hash[key]
                            referers_hash[key] = old_value + value
                        else
                            referers_hash[key] = value
                        end
                    end
                    impression.referers = referers_hash
                else
                    impression.referers = referers
                end
            end
            $redis.del("tracker_#{tracker.uuid}")
            $redis.del("tracker_#{tracker.uuid}_referers")
             impression.save
        end
    end
end