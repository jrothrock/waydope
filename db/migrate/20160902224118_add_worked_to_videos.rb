class AddWorkedToVideos < ActiveRecord::Migration[5.0]
  def change
  	add_column :videos, :worked, :boolean, null:false, default:false
  end
end
