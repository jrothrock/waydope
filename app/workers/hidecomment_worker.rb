class HidecommentWorker
    include Sidekiq::Worker
	def perform
		comments = Comment.where('hide_proccessing = true').all
        if comments
            comments.each do |comment|
                if comment.commentable_type == 'Song'
                    post = Song.where("id = ?", comment.commentable_uuid).first
                elsif comment.commentable_type == 'News_post'
                    post = NewsPost.where("id = ?", comment.commentable_uuid).first
                elsif comment.commentable_type == 'Video'
                    post = Video.where("id = ?", comment.commentable_uuid).first
                end
                if post
                    post.comment_count -= 1
                    post.save
                end
            end
		end
	end
end
