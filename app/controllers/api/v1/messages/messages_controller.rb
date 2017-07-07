class Api::V1::Messages::MessagesController < ApplicationController
	def create
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
		if user
			receiver = params[:receiver] ? User.where('username = ?', params[:receiver]).first : nil
			if receiver && receiver != user.username
				if !receiver.banned
					usernames = [user.username, receiver.username]
					conversation = Message.select(:conversation_id).where('receiver IN (?) AND sender in (?)', usernames,usernames).first
					conversation = conversation ? conversation.conversation_id : Message.createConversationId
					message = Message.new
					message.receiver = receiver.username
					message.sender = user.username
					message.conversation_id = conversation
					message.body =  ActionController::Base.helpers.sanitize(params[:body])
					if message.save
						message.time_ago = time_ago_in_words(message.created_at) + ' ago'
						render json:{message:message}, status: :ok
					else
						render json:{}, status: :internal_server_error
					end
				else
					render json:{banned:true, message:"this user has been banned."}, status: :gone
				end
			else
				render json:{message: 'no user found'}, status: :not_found
			end
		else
			render json:{}, status: :unauthroized
		end
	end
	def read
		user = request.headers["Authorization"] ? User.find_by_token(request.headers["Authorization"].split(' ').last) : nil
		offset = request.headers["offset"] && request.headers["offset"].to_i > 0 ? request.headers["offset"].to_i : 0
		if user
			puts request.headers["id"]
			sanitized_query = Message.escape_sql(["SELECT m.*, ( SELECT count(*) FROM messages WHERE conversation_id = m.conversation_id) total FROM messages m WHERE m.conversation_id = ? GROUP BY m.id ORDER BY m.id DESC LIMIT 10 OFFSET ?", request.headers["id"], offset])
            messages = Message.find_by_sql(sanitized_query).to_a
			conversation = Time_ago::Time.single(messages.reverse)
			if conversation.length > 0
				if conversation.first.sender === user.username || conversation.first.receiver === user.username
					render json:{conversation:conversation,offset:(offset+10)}, status: :ok
					if !conversation.last.read
						MessagereadWorker.perform_async(request.headers["id"])
					end
				else
					render json:{message:"you don't have access to that message"}, status: :unauthroized
				end
			else
				render json:{}, status: :not_found
			end
		else
			render json:{}, status: :unauthroized
		end
	end
end
