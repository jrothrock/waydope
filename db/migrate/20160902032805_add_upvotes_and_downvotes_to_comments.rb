class AddUpvotesAndDownvotesToComments < ActiveRecord::Migration[5.0]
  def change

	add_column :comments, :upvotes, :integer, null:false, default:0
  	add_column :comments, :downvotes, :integer, null:false, default:0
  	add_column :comments, :average_vote, :integer, null:false, default:0
  	add_column :comments, :vote_count, :integer, null:false, default:0

  	add_column :replies, :upvotes, :integer, null:false, default:0
  	add_column :replies, :downvotes, :integer, null:false, default:0
  	add_column :replies, :average_vote, :integer, null:false, default:0
  	add_column :replies, :vote_count, :integer, null:false, default:0

  end
end
