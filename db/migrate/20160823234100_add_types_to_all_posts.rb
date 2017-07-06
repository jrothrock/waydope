class AddTypesToAllPosts < ActiveRecord::Migration[5.0]
  def change
  	add_column :songs, :post_type, :string, null:false, default: "music"
  	add_column :news_posts, :post_type, :string, null:false, default: "news"
  	add_column :videos, :post_type, :string, null:false, default: "videos"
  end
end
