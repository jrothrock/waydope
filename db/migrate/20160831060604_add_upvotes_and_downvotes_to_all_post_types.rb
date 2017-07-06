class AddUpvotesAndDownvotesToAllPostTypes < ActiveRecord::Migration[5.0]
  def change
  	add_column :news_posts, :upvotes, :integer, null:false, default:0
  	add_column :news_posts, :downvotes, :integer, null:false, default:0
  	add_column :news_posts, :average_vote, :integer, null:false, default:0

  	add_column :videos, :upvotes, :integer, null:false, default:0
  	add_column :videos, :downvotes, :integer, null:false, default:0
  	add_column :videos, :average_vote, :integer, null:false, default:0
  end
end
