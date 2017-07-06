class KarmaWorker
    include Sidekiq::Worker
	def perform(type,post,vote)
		submitted_by = post["submitted_by"] ? post["submitted_by"] : nil
        if submitted_by
            user = User.where("username = ?", submitted_by).first
            if type  === 'comments'
                user.comment_karma += vote.to_i
            else
                user["#{type}_karma"] += vote.to_i
            end
            user.karma += vote
            user.save
        end
	end
end