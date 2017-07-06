class HidereplyWorker
    include Sidekiq::Worker
	def perform
		replies = Reply.where('hide_proccessing = true').all
        if replies
            replies.each do |reply|
                if reply.post_type == 'music'
                    post = Song.where("uuid = ?", reply.post_id).first
                elsif reply.post_type == 'news'
                    post = NewsPost.where("uuid = ?", reply.post_id).first
                elsif reply.post_type == 'videos'
                    post = Video.where("uuid = ?", reply.post_id).first
                end
                if post
                    post.comment_count -= 1
                    post.save
                end
            end
		end
	end
end
