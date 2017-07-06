class AddVotesToSongs < ActiveRecord::Migration[5.0]
  def change
  	add_column :songs, :upvotes, :integer, null:false, default:0
  	add_column :songs, :downvotes, :integer, null:false, default:0
  	add_column :songs, :average_vote, :integer, null:false, default:0
  	add_column :songs, :votes_count, :integer, null:false, default:0
  	add_column :songs, :user_voted, :integer
  	add_column :songs, :users_voted, :text, array:true, null:false, default:[]
  	add_column :songs, :users_voted_type, :text, array:true, null:false, default:[]
  end
end
