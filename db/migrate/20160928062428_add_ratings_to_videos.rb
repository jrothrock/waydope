class AddRatingsToVideos < ActiveRecord::Migration[5.0]
  def change
  	add_column :videos, :user_rated, :integer
  	add_column :videos, :average_rating, :integer, null:false, default:100
  	add_column :videos, :ratings_count, :integer, null:false, default:0
  	add_column :videos, :users_rated, :text, array:true, null:false, default:[]
  	add_column :videos, :ratings_user, :text, array:true, null:false, default:[]
  	add_column :videos, :ratings, :text, array:true, null:false, default:[]
  	add_column :videos, :average_simplified_rating, :integer, null:false, default:0
  	add_column :videos, :average_simplified_rating_count, :integer, null:false, default:0

  	add_column :videos, :user_liked, :boolean, null:false, default:false
  	add_column :videos, :likes, :text, array:true, null:false, default: []
  	add_column :videos, :likes_count, :integer, null:false, default:0
  	add_column :users, :videos, :text, array:true, null:false, default: [] 
  end
end
