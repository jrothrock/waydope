class AddIndexesToCreatedAt < ActiveRecord::Migration[5.0]
  def change
  	add_index :board_categories, :created_at
  	add_index :video_categories, :created_at
  	add_index :music_genres, :created_at
  	add_index :songs, :created_at
  	add_index :videos, :created_at
  	add_index :news_posts, :created_at
  end
end
