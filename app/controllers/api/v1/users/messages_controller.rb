class Api::V1::Users::MessagesController < ApplicationController
	def index
        user = User.find_by_token(request.headers["Authorization"].split(' ').last)
        if user

            sanitized_query = Message.escape_sql(["SELECT m.*, ( SELECT count(*) FROM messages WHERE read = false AND receiver = m.receiver) count, ( SELECT count(*) FROM messages WHERE receiver = m.receiver) total FROM messages m WHERE receiver = ? GROUP BY m.id ORDER BY m.id DESC LIMIT 10", user.username])
            inbox = Message.find_by_sql(sanitized_query).to_a

            sanitized_query = Message.escape_sql(["SELECT m.*, ( SELECT count(*) FROM messages WHERE sender = m.sender) count, ( SELECT count(*) FROM messages WHERE sender = m.receiver) total FROM messages m WHERE receiver = ? GROUP BY m.id ORDER BY m.id DESC LIMIT 10", user.username])
            outbox = Message.find_by_sql(sanitized_query).to_a

            messages = Time_ago::Time.batch([inbox,outbox])

            # sanitized_query = Notification.escape_sql(["SELECT count(*) FROM notifications WHERE read = false AND user_username = ? UNION ALL SELECT * FROM notifications WHERE user_username = ? LIMIT 5", user.username, user.username])
            # sanitized_query = Notification.escape_sql(["SELECT c.cntr, n.* FROM notifications n, (SELECT count(*) cntr FROM notifications note WHERE note.read = false AND note.user_username = ?) c WHERE user_username = ? LIMIT 5", user.username, user.username])
            # sanitized_query = Notification.escape_sql(["SELECT n.* FROM notifications n WHERE n.user_username = ?, RIGHT JOIN (SELECT count(*) FROM notifications WHERE read = false AND user_username = ? GROUP BY id) note ON n.id = note.id ", user.username, user.username])

            # notifications = Notification.where('user_username = ?', user.username).limit(5)
            # count = Notification.where("read = false AND user_username = ?", user.username).count
            render json: {status:200, success: true, inbox:messages[0],outbox: messages[1]}
        else
		    render json: {status: 404, success:false }
        end
	end

    def read
        user = User.find_by_token(request.headers["Authorization"].split(' ').last)
        if user
            sanitized_query = Message.escape_sql(["SELECT m.* FROM (SELECT DISTINCT ON (conversation_id) m.*, ( SELECT count(*) FROM (SELECT DISTINCT ON (conversation_id) * FROM messages WHERE receiver = m.receiver ORDER BY conversation_id, created_at DESC, id DESC) messages WHERE read = false AND receiver = m.receiver) count, ( SELECT count(*) FROM (SELECT DISTINCT ON (conversation_id) * FROM messages WHERE receiver = m.receiver ORDER BY conversation_id) messages WHERE receiver = m.receiver) total FROM messages m WHERE receiver = ? ORDER BY conversation_id, created_at DESC, id DESC) m ORDER BY created_at DESC LIMIT 10", user.username])
            messages = Message.find_by_sql(sanitized_query)
            messages = Time_ago::Time.single(messages)
            render json: {status:200, success: true, messages: messages}
        else
		    render json: {status: 404, success:false }
        end
    end

    def update
        user = User.find_by_token(request.headers["Authorization"].split(' ').last)
        if user
            notifications = params[:ids] ? Notification.where('user_username = ? AND read = false AND id IN (?)',user.username,params[:ids]).update_all('read = true') : nil
            puts notifications.length
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
