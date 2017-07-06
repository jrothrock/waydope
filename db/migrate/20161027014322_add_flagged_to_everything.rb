class AddFlaggedToEverything < ActiveRecord::Migration[5.0]
  def change
  	add_column :news_posts, :flagged, :boolean, null:false, default:false
  	add_column :news_posts, :flagged_type, :integer

  	add_column :songs, :flagged, :boolean, null:false, default:false
  	add_column :songs, :flagged_type, :integer

  	add_column :videos, :flagged, :boolean, null:false, default:false
  	add_column :videos, :flagged_type, :integer

  	add_column :comments, :flagged, :boolean, null:false, default:false
  	add_column :comments, :flagged_type, :integer

  	add_column :replies, :flagged, :boolean, null:false, default:false
  	add_column :replies, :flagged_type, :integer
  end
end
