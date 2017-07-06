class AddLikedSongsToUser < ActiveRecord::Migration[5.0]
  def change
  	add_column :users, :songs, :text, array:true, null:false, default: []
  end
end
