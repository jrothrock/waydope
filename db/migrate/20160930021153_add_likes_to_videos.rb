class AddLikesToVideos < ActiveRecord::Migration[5.0]
  def change
  	add_column :users, :news_posts, :text, array:true, null:false, default: [] 
  	add_column :news_posts, :likes, :text, array:true, null:false, default:[]
  	add_column :news_posts, :user_liked, :boolean, null:false, default:false
  	add_column :news_posts, :likes_count, :integer, null:false, default:0

  	add_column :news_posts, :user_rated, :integer
  	add_column :news_posts, :average_rating, :integer, null:false, default:100
  	add_column :news_posts, :ratings_count, :integer, null:false, default:0
  	add_column :news_posts, :users_rated, :text, array:true, null:false, default:[]
  	add_column :news_posts, :ratings_user, :text, array:true, null:false, default:[]
  	add_column :news_posts, :ratings, :text, array:true, null:false, default:[]
  	add_column :news_posts, :average_simplified_rating, :integer, null:false, default:0
  	add_column :news_posts, :average_simplified_rating_count, :integer, null:false, default:0
  end
end
