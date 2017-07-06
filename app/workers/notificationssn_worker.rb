class NotificationssnWorker
    include Sidekiq::Worker
    def perform(uuid)
        user = User.where("uuid = ?", uuid).first
        notification = Notification.new
        notification.user_username = user.username
        notification.notified_by = 'System'
        notification.notice_type = "SSN"
        notification.post_type = ""
        notification.category = ""
        notification.url = "#{Rails.env.production? ? "https://waydope.com/user/#{user.username}settings" : "localhost:4200/settings" }"
        notification.title = "SSN is Required"
        notification.save
        UserMailer.ssn_required(user).deliver
    end
end
