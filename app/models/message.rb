class Message < ApplicationRecord
    def self.createConversationId
        begin 
            uid = SecureRandom.hex(5)
            uid[0] = '' # bring string down to 9 characters
            if(Message.unscoped.where("conversation_id = ?", uid).any?) then raise 'Go buy some lotto tickets, UID has a duplicate!' end
            return uid
        rescue
            retry
        end 
    end
end
