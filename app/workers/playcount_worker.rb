class PlaycountWorker
	include Sidekiq::Worker
	def perform(id,auth,type,remote_ip,tracker)
        user = auth ? User.find_by_token(auth) : nil
        db_type = App.classGet(type)
        type_type = App.typeGet(type)

        post = Object.const_get(db_type).where("worked = true AND form = 1 AND uuid = ?", id).first
        tracker = tracker ? Tracker.where("uuid = ?", tracker).first : nil
        if post
            post.total_plays = post.total_plays ? post.total_plays + 1 : 1
            if user
                post.user_plays = post.user_plays ? post.user_plays + 1 : 1
            else
                post.guest_plays = post.guest_plays ? post.guest_plays + 1 : 1
            end
            if post.plays && post.plays != '{}' && tracker && tracker.uuid
                plays = post.plays
                if plays.key?(tracker.uuid)
                    value = plays[tracker.uuid].to_i
                    plays[tracker.uuid] = value + 1
                else
                    plays[tracker.uuid] = 1
                end
                post.plays = plays
            elsif tracker && tracker.uuid
                post.plays = {tracker.uuid => 1}
            end
            if post.plays_ip && post.plays_ip != '{}'
                plays_ip = post.plays_ip
                if plays_ip.key(remote_ip)
                    value = plays_ip[remote_ip]
                    plays_ip[remote_ip] = value + 1
                else
                    plays_ip[remote_ip] = 1
                end
                post.plays_ip = plays_ip
            else
                post.plays_ip = {remote_ip => 1}
            end
            if user
                if user["#{type_type}_played"] && user["#{type_type}_played"] != "{}"
                    plays = user["#{type_type}_played"]
                    if plays.key?(post.uuid)
                        value = plays[post.uuid]
                        plays[post.uuid] = value + 1
                    end
                    user["#{type_type}_viewed"] = plays
                else
                    user["#{type_type}_played"] = {post.uuid => 1}
                end
                user.save
            end
            post.save
        end
	end
end