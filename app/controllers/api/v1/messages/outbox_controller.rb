class Api::V1::Messages::OutboxController < ApplicationController
    def read
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user
            offset = request.headers["offset"] && request.headers["offset"].to_i % 1 === 0  ? request.headers["offset"].to_i : 0
            sanitized_query = Message.escape_sql(["SELECT m.* FROM (SELECT DISTINCT ON (conversation_id) m.* FROM messages m WHERE sender = ? ORDER BY conversation_id, created_at) m ORDER BY created_at DESC LIMIT 10 OFFSET ?", user.username, offset])
            messages = Message.find_by_sql(sanitized_query)
            messages = Time_ago::Time.single(messages)
            if messages
                    render json:{status:200,success:true,messages:messages,offset:(offset+10)}
            else
                render json:{status:404,success:false}
            end
        else
            render json:{status:401, success:false}
        end 
    end
end
