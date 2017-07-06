class CheckcommentWorker
    include Sidekiq::Worker
	def perform(id)
        comment = Comment.find_by_id(id)
        if !App.checkContent(comment.stripped)
            puts 'comment is not very gud'
            RemovecommentWorker.perform_in(1.minute,comment.id)
        end
	end
end
