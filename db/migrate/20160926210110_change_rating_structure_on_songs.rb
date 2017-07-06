class ChangeRatingStructureOnSongs < ActiveRecord::Migration[5.0]
  def change
  	add_column :songs, :average_advanced_rating, :integer, null:false, default:0
  	add_column :songs, :average_advanced_rating_count, :integer, null:false, default:0

  	add_column :songs, :average_simplified_rating, :integer, null:false, default:0
  	add_column :songs, :average_simplified_rating_count, :integer, null:false, default:0

  	add_column :songs, :average_message_rating, :integer, null:false, default:0
  	add_column :songs, :average_message_rating_count, :integer, null:false, default:0

  	add_column :songs, :average_production_rating, :integer, null:false, default:0
  	add_column :songs, :average_production_rating_count, :integer, null:false, default:0

  	add_column :songs, :average_originality_rating, :integer, null:false, default:0
  	add_column :songs, :average_originality_rating_count, :integer, null:false, default:0

  	add_column :songs, :average_whinyness_rating, :integer, null:false, default:0
  	add_column :songs, :average_whinyness_rating_count, :integer, null:false, default:0
  end
end
