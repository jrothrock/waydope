class AddVideosAndNewsPostToComments < ActiveRecord::Migration[5.0]
  def change
  	add_column :comments, :video_id, :integer
  	add_column :comments, :news_post_id, :integer
    add_index :comments, :video_id
    add_index :comments, :news_post_id
  end
end
