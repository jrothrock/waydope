class MessagereadWorker
    include Sidekiq::Worker
	def perform(id)
        Message.where("conversation_id = ?", id).update_all(read:true)
	end
end
