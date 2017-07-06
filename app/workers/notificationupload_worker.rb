class NotificationuploadWorker
    include Sidekiq::Worker
    def perform(post)
            notification = Notification.new
            notification.user_username = post["submitted_by"]
            notification.notified_by = 'System'
            notification.notice_type = "upload"
            notification.post_type = post["post_type"]
            if notification.post_type === 'music'
                notification.category = post["main_genre"]
            elsif notification.post_type === 'videos' || notification.post_type === 'news'
                notification.category = post["main_category"]
            else
                notification.category = post["main_category"]
                notification.subcategory = post["sub_category"]
            end
            notification.url = post["url"]
            
            case notification.post_type
            when 'music'
                notification.title = post["title"]
            when 'boards'
                notification.title = post["title"]
            when 'videos'
                notification.title = post["title"]
            when 'apparel'
                notification.title = post["title"]
            when 'technology'
                notification.title = post["title"]
            end
            notification.save
    end
end
