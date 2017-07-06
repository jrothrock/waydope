class ViewcountWorker
	include Sidekiq::Worker
	def perform(id,user_id,type,remote_ip)
        if user_id
            user = user_id ?  User.find_by_id(user_id) : nil
        end
        db_type = App.classGet(type)
        type_type = App.typeGet(type)

        post = Object.const_get(db_type).where("uuid = ? AND worked = true", id).first
        if post
            post.total_views += 1

            views_ip = post.views_ip
            views = post.views

            if user
                post.user_views += 1
                if views.key?(user.uuid)
                    value = views[user.uuid].to_i
                    views[user.uuid] = value + 1
                else
                    post.unique_views += 1
                    views[user.uuid] = 1
                end
            else
                post.guest_views += 1
                if !views_ip.key?(remote_ip)
                    post.unique_views += 1
                end
            end
            post.views = views

            if views_ip.key(remote_ip)
                value = views_ip[remote_ip]
                views_ip[remote_ip] = value + 1
            else
                views_ip[remote_ip] = 1
            end
            post.views_ip = views_ip
            if user
                if type_type != 'products'
                    views = user["#{type_type}_viewed"]
                else
                    views = user["#{type}_viewed"]
                end
                if views.key?(post.uuid)
                    value = views[post.uuid]
                    views[post.uuid] = value + 1
                else
                    views[post.uuid] = 1
                end
                if type_type != 'products'
                    user["#{type_type}_viewed"] = views
                else
                    user["#{type}_viewed"] = views
                end
                user.save
            end
            post.save
        end
	end
end