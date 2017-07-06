class NotificationcommentWorker
    include Sidekiq::Worker
    def perform
        comments = Comment.where('notified = false').all
        comments.each do |comment|
            parent = Comment.where("uuid = ?", comment.parent_uuid).first
            if comment.submitted_by != parent.submitted_by
                notification = Notification.new
                notification.user_username = parent.submitted_by
                notification.notified_by = comment.submitted_by
                notification.notice_type = "comment"
                notification.post_type = comment.post_type === 'news' ? 'boards' : comment.post_type
                notification.category = comment.category
                notification.subcategory = comment.subcategory
                notification.url = comment.url
                notification.body = "#{comment.stripped.gsub(/\n/,'')[0..40]}#{comment.stripped.gsub(/\n/,'')[41] === ' ' ?  ' ' : ''}#{comment.stripped.length > 41 ? comment.stripped.gsub(/\n/,'')[41..comment.stripped.length].split()[0] : ''}"
                notification.notified_by_id = parent.uuid

                case notification.post_type
                when 'music'
                    notification.title = Song.where('url = ?', notification.url).first.title
                when 'boards'
                    notification.title = NewsPost.where('url = ?', notification.url).first.title
                when 'videos'
                    notification.title = Video.where('url = ?', notification.url).first.title
                when 'apparel'
                    notification.title = Product.where("post_type = 'apparel' AND category = ? AND subcategory = ? AND url = ?", notication.category, notification.subcategory, notification.url).first.title
                when 'technology'
                    notification.title = Product.where("post_type = 'technology' AND category = ? AND subcategory = ? AND url = ?", notication.category, notification.subcategory, notification.url).first.title
                end
                notification.save
            end
            comment.notified = true
            comment.save
        end
    end
end
