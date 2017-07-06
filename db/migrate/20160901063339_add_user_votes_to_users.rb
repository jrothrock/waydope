class AddUserVotesToUsers < ActiveRecord::Migration[5.0]
  def change
  	add_column :users, :votes, :text, array:true, null:false, default: []
  	add_column :users, :votes_count, :integer, null:false, default: 0
  	add_column :users, :average_vote, :integer, null:false, default: 0
  	add_column :users, :karma, :integer, null:false, default: 0
  end
end
