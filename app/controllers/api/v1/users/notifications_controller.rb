class Api::V1::Users::NotificationsController < ApplicationController
	def index
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user
            sanitized_query = Notification.escape_sql(["SELECT noti.*, ( SELECT count(*) FROM notifications WHERE read = false AND user_username = noti.user_username) count, ( SELECT count(*) FROM notifications WHERE user_username = noti.user_username) total FROM notifications noti WHERE user_username = ? GROUP BY noti.id ORDER BY id DESC LIMIT 10", user.username])
            notifications = Notification.find_by_sql(sanitized_query)

            sanitized_query = Message.escape_sql(["SELECT m.* FROM 
                                                    (SELECT DISTINCT ON (conversation_id) m.*, 
                                                        ( SELECT count(*) FROM (SELECT DISTINCT ON (conversation_id) * FROM messages WHERE receiver = m.receiver ORDER BY conversation_id, created_at DESC) messages WHERE read = false AND receiver = m.receiver) count, 
                                                        ( SELECT count(*) FROM (SELECT DISTINCT ON (conversation_id) * FROM messages WHERE receiver = m.receiver ORDER BY conversation_id, created_at DESC) messages WHERE receiver = m.receiver) total 
                                                        FROM messages m WHERE receiver = ? ORDER BY conversation_id, created_at DESC, id DESC) m ORDER BY created_at DESC LIMIT 10", 
                                                user.username])
            inbox = Message.find_by_sql(sanitized_query)

            sanitized_query = Message.escape_sql(["SELECT m.* FROM (SELECT DISTINCT ON (conversation_id) m.*,( SELECT count(*) FROM (SELECT DISTINCT ON (conversation_id) * FROM messages WHERE sender = m.sender ORDER BY conversation_id) messages WHERE sender = m.sender) total FROM messages m WHERE sender = ? ORDER BY conversation_id, created_at DESC, id DESC) m ORDER BY m.id DESC LIMIT 10", user.username])
            outbox = Message.find_by_sql(sanitized_query)
            
            timed = Time_ago::Time.batch([notifications,inbox,outbox])
            # sanitized_query = Notification.escape_sql(["SELECT count(*) FROM notifications WHERE read = false AND user_username = ? UNION ALL SELECT * FROM notifications WHERE user_username = ? LIMIT 5", user.username, user.username])
            # sanitized_query = Notification.escape_sql(["SELECT c.cntr, n.* FROM notifications n, (SELECT count(*) cntr FROM notifications note WHERE note.read = false AND note.user_username = ?) c WHERE user_username = ? LIMIT 5", user.username, user.username])
            # sanitized_query = Notification.escape_sql(["SELECT n.* FROM notifications n WHERE n.user_username = ?, RIGHT JOIN (SELECT count(*) FROM notifications WHERE read = false AND user_username = ? GROUP BY id) note ON n.id = note.id ", user.username, user.username])

            # notifications = Notification.where('user_username = ?', user.username).limit(5)
            # count = Notification.where("read = false AND user_username = ?", user.username).count
            
            render json: {status:200, success: true, notifications: timed[0], inbox:timed[1],outbox: timed[2]}
        else
		    render json: {status: 404, success:false }
        end
	end

    def read
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user
            puts request.headers["offset"]
            offset = request.headers["offset"].to_i % 1 ? request.headers["offset"].to_i : 0
            sanitized_query = Notification.escape_sql(["SELECT noti.*, ( SELECT count(*) FROM notifications WHERE read = false AND user_username = noti.user_username) count,  ( SELECT count(*) FROM notifications WHERE user_username = noti.user_username) total FROM notifications noti WHERE user_username = ? GROUP BY noti.id ORDER BY id DESC OFFSET ? LIMIT 10", user.username, offset])
            notifications = Notification.find_by_sql(sanitized_query)
            if notifications && notifications.first
                total = notifications.first.total
                pages = (total / 10).ceil
                page = (offset/10)
                ssn = notifications.map{|noti| noti.notice_type === 'SSN' }.include?(true)
                if ssn && user.ssn_required
                    render json: {status:200, success: true, notifications: notifications,offset:offset,pages:pages,page:page,total:total,ssn:ssn}
                else
                    render json: {status:200, success: true, notifications: notifications,offset:offset,pages:pages,page:page,total:total}
                end
            else 
                render json: {status: 404, success:false}
            end
        else
		    render json: {status: 404, success:false }
        end
    end

    def update
        user =  request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user
            notifications = Notification.where('user_username = ? AND read = false',user.username).update_all('read = true')
            puts notifications
            if notifications > 0
                render json: {status:200, success:true}
             else
                render json: {status: 404, success: false}
            end
        else
            render json: {status:401, success:false}
        end
    end
end
