class AddLikesUserLikedAndLikesCountToMusic < ActiveRecord::Migration[5.0]
  def change
  	add_column :songs, :likes, :text, array:true, null:false, default: []
  	add_column :songs, :user_liked, :boolean, null:false, default:false
  end
end
