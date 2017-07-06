class Comment < ApplicationRecord

  belongs_to :commentable, polymorphic: true
  # has_many :comments, dependent: :delete_all
  belongs_to :parent, :class_name => "Comment", :foreign_key => "parent_uuid", primary_key: :uuid
  has_many :replies, -> { select(App.getGoodColumns('comments',true)) }, :class_name => "Comment", :foreign_key => "parent_uuid", dependent: :delete_all, primary_key: :uuid
  def self.columns
  		super.reject {|column| column.name == 'deleted_description' || column.name == 'deleted_submitted_by' || column.name == 'deleted_user_id'}
  end

  def self.user_voted(comment,user)
      user_voted = comment.votes.key?(user) ? comment.votes[user] : nil
  end

  def self.removal_reason(reason)
    case reason
		when 'spam'
      return '[Your comment has been removed for being blatant spam shit.]'
    when 'stupid'
      return '[Your comment has been removed for being straight idiotic.]'
    when 'hate'
      return '[Your comment has been removed for being just straight up hate.]'
    else 
      return '[Removed]'
    end
  end
  
  def self.setUUID
    begin 
      uuid = SecureRandom.hex(5)
      uuid[0] = '' # bring string down to 9 characters
      if(Comment.unscoped.where("uuid = ?", uuid).any?) then raise 'Go buy some lotto tickets, UUID has a duplicate!' end
      return uuid
      rescue
        retry
    end
  end

  def self.sanitize(id,body)
    # this should be built before, but implemented after seeing how the
    # comments end up.
    words = 'foo, bar, test, boo'.split(',').map(&:strip)
    if words.any? { |s| body.include?(s) }
     return false
    else
      return true
    end
  end

  def self.createMod(post_id, id, commentable_uuid, commentable_type, url, title, category, subcategory, post_type)
        post = findPost(comment,post_type)
        user = User.where('uuid = ?', comment.user_uuid).first
        values = comment.value
        new_comment = Comment.new
        new_comment.parent_uuid = comment.reply_to ? comment.reply_to : nil
        new_comment.upvotes = 1
        new_comment.average_vote = 1
        new_comment.votes = {comment.user_uuid => 1}
        new_comment.body = "Your comment was removed for not following the TOS. This action was performed automatically."
        new_comment.stripped = "Your comment was removed for not following the TOS. This action was performed automatically."
		    new_comment.marked = "Your comment was removed for not following the TOS. This action was performed automatically."
        new_comment.commentable_type = commentable_type
        new_comment.commentable_uuid = commentable_uuid
        new_comment.url = url
        new_comment.title = title
        new_comment.parent_uuid = comment.reply_to

        #new_comment.notified = comment.reply_to ? false : true
        new_comment.notified = true
        # new_comment.admin = user && user.admin ? true : false
    	  # new_comment.seller = user && user.seller ? true : false
        # new_comment.styled = comment.admin || comment.seller || comment.submitter ? true : false
        # new_comment.submitter = post.submitted_by === user.username ? true : false
        new_comment.category = post_category
        new_comment.subcategory = (post_type === 'apparel' || post_type === 'technology') &&  subcategory ? subcategory : nil
        new_comment.post_type = post_type
        new_comment.submitted_by = user.username

        post.comment_count += 1
        new_comment.save && post.save
  end 

  def self.findPost(id,post_type)
      if post_type === 'music'
          post = Song.find_by_id(id)
      elsif post_type === 'videos'
          post = Video.find_by_id(id)
      elsif post_type === 'news'
          post = NewsPost.find_by_id(id)
      elsif post_type === 'apparel'
          post = Product.find_by_id(id)
      elsif post_type === 'technology'
          post = Product.find_by_id(id)
      elsif post_type === 'comments'
			  post = Comment.find_by_id(id)
		  end
  end

  private 

  def comment_type(post_type)
    if post_type === 'music'
      return 'Song'
    elsif post_type === 'videos'
      return 'Video'
    elsif post_type === 'news'
      return 'News_post'
    elsif post_type === 'apparel'
      return 'Apparel'
    elsif post_type === 'technology'
      return 'Technology'
    end
  end
  def self.select_with columns
  		select(columns.map(&:to_s))
	end
end
