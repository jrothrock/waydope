class AddTimestampsToCategories < ActiveRecord::Migration[5.0]
  def self.up
  	change_table :board_categories do |t|
  		t.timestamps
  	end
  	change_table :music_genres do |t|
  		t.timestamps
  	end
  	change_table :video_categories do |t|
  		t.timestamps
  	end
  	remove_column :board_categories, :name
  	add_column :board_categories, :title, :string

  	remove_column :music_genres, :name
  	add_column :music_genres, :title, :string

  	remove_column :video_categories, :name
  	add_column :video_categories, :title, :string
  end
  def self.down
  	remove_column :board_categories, :created_at
  	remove_column :board_categories, :updated_at
  	remove_column :board_categories, :title
  	add_column :board_categories, :name, :string

  	remove_column :music_genres, :created_at
  	remove_column :music_genres, :updated_at
  	remove_column :music_genres, :title
  	add_column :music_genres, :name, :string

  	remove_column :video_categories, :created_at
  	remove_column :video_categories,:updated_at
  	remove_column :video_categories, :title
  	add_column :video_categories, :name, :string
  end
end
