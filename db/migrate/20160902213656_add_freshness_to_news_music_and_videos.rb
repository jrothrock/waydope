class AddFreshnessToNewsMusicAndVideos < ActiveRecord::Migration[5.0]
  def change
  	add_column :news_posts, :freshness, :integer, null:false, default: 0
  	add_column :songs, :freshness, :integer, null:false, default: 0
  	add_column :videos, :freshness, :integer, null:false, default: 0

  	add_index :news_posts, :freshness
  	add_index :songs, :freshness
  	add_index :videos, :freshness
  end
end
