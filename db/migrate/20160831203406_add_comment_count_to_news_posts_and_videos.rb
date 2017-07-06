class AddCommentCountToNewsPostsAndVideos < ActiveRecord::Migration[5.0]
  def change
    add_column :news_posts, :comment_count, :integer, null:false, default:0
    add_column :videos, :comment_count, :integer, null:false, default: 0
  end
end
