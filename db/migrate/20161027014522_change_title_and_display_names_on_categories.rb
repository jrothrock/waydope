class ChangeTitleAndDisplayNamesOnCategories < ActiveRecord::Migration[5.0]
  def change
   	remove_column :board_categories, :display
  	add_column :board_categories, :url, :string

  	remove_column :music_genres, :display
  	add_column :music_genres, :url, :string

  	remove_column :video_categories, :display
  	add_column :video_categories, :url, :string

  	add_index :board_categories, :url
  	add_index :video_categories, :url
  	add_index :music_genres, :url
  end
end
