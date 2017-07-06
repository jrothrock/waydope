class RemovecommentWorker
    include Sidekiq::Worker
	def perform(id)
        comment = Comment.find_by_id(id)
        comment.removed = true
        comment.body = "[Removed]"
        comment.marked = "[Removed]"
        comment.stripped = "[Removed]"
        new_comment = Comment.new
        new_comment.commentable_type = comment.commentable_type
        new_comment.commentable_uuid = comment.commentable_uuid
        new_comment.category = comment.category
        new_comment.subcategory = comment.subcategory
        new_comment.submitted_by = "WayDope"
        new_comment.upvotes = 1
        new_comment.average_vote = 1
        new_comment.votes = {"waydope" => 1}
        new_comment.body = 'Your comment has been flagged by our system, and has been removed. This process is automatic.'
        new_comment.marked = "<p>Your comment has been flagged by our system, and has been removed. This process is automatic.</p>"
        new_comment.stripped = 'Your comment has been flagged by our system, and has been removed. This process is automatic.'
        new_comment.notified = true
        new_comment.parent_id = comment.id
        new_comment.uid = Comment.getUID
        new_comment.post_type = comment.post_type
        new_comment.url = comment.url
        new_comment.title = comment.title
        new_comment.user_id = 0
        new_comment.admin = true
        new_comment.seller = false
        new_comment.submitter = false
        new_comment.styled = true
        new_comment.generation = 0
        type = comment.commentable_type != "Apparel" && comment.commentable_type != "Technology" ? comment.commentable_type : "Product"
        post = Object.const_get(type).increment_counter(:comment_count, comment.commentable_id)
        comment.save && new_comment.save
	end
end
