class Api::V1::Messages::Conversation::MessagesController < ApplicationController    
    def read
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user
            offset = request.headers["offset"] && request.headers["offset"].to_i % 1 === 0  ? request.headers["offset"].to_i : 0
            messages = Message.where('coversation_id = ?', user.username).offset(offset).limit(20)
            if messages != []
                if(messages.first.receiver != user.username && messages.first.sender != user.username)
                    render json:{status:401, success:false}
                else
                    render json:{status:200,success:true,messages:messages}
                end
            else
                render json:{status:404,success:false}
            end
        else
            render json:{status:401, success:false}
        end
    end
end
