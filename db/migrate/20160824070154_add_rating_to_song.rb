class AddRatingToSong < ActiveRecord::Migration[5.0]
  def change
  	add_column :songs, :ratings, :text, array:true, null:false, default: []
  	add_column :songs, :average_rating, :integer, null:false, default: 100
  	add_column :songs, :ratings_user, :text, array:true, null:false, default: []
  	add_column :songs, :ratings_count, :integer, null:false, default: 0
  	add_column :songs, :user_rated, :boolean, null:false, default: false
  	
  	add_column :users, :ratings, :text, array:true, null:false, default: []
  	add_column :users, :ratings_count, :integer, null:false, default: 0
  	add_column :users, :ratings_songs, :text, array:true, null:false, default: []
  	add_column :users, :ratings_songs_ids, :text, array:true, null:false, default: []
  	add_column :users, :ratings_songs_count, :integer, null:false, default: 0
  	add_column :users, :average_rating, :integer, null:false, default: 100
  	add_column :users, :average_rating_songs, :integer, null:false, default: 100
  end
end
