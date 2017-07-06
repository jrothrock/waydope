class AddWorkedToSongs < ActiveRecord::Migration[5.0]
  def change
  	add_column :songs, :worked, :boolean, null:false, default:false
  end
end
