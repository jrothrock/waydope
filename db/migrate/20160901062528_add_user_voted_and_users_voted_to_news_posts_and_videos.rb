class AddUserVotedAndUsersVotedToNewsPostsAndVideos < ActiveRecord::Migration[5.0]
  def change

  	add_column :news_posts, :users_voted, :text, array:true, null:false, default: []
  	add_column :news_posts, :user_voted, :boolean, null:false, default: false
  	add_column :news_posts, :votes_count, :integer, null:false, default: 0

  	add_column :videos, :users_voted, :text, array:true, null:false, default: []
  	add_column :videos, :user_voted, :boolean, null:false, default: false
  	add_column :videos, :votes_count, :integer, null:false, default: 0
  	
  end
end
