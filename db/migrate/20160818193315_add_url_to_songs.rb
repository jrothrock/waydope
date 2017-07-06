class AddUrlToSongs < ActiveRecord::Migration[5.0]
  def change
  	add_column :songs, :url, :string, null: false, default: ""
  	add_index :songs, :url
  	add_index :songs, :artist
  	add_index :songs, :genre
  end
end
