class AddIsDestroyedToSongs < ActiveRecord::Migration[5.0]
  def change
  	add_column :songs, :is_deleted, :boolean, null:false, default:false
  end
end
