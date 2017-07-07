class Api::V1::Messages::Conversation::MessagesController < ApplicationController    
    def read
        user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
        if user
            offset = request.headers["offset"] && request.headers["offset"].to_i % 1 === 0  ? request.headers["offset"].to_i : 0
            messages = Message.where('coversation_id = ?', user.username).offset(offset).limit(20)
            if messages != []
                if(messages.first.receiver != user.username && messages.first.sender != user.username)
                    render json:{}, status: :unauthorized
                else
                    render json:{messages:messages}, status: :ok
                end
            else
                render json:{}, status: :not_found
            end
        else
            render json:{}, status: :unauthorized
        end
    end
end
