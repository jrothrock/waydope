class AddUserVotedToCommentsAndReplies < ActiveRecord::Migration[5.0]

  def self.up
  	change_table :news_posts do |t|
      t.remove :user_voted
      t.column :user_voted, :integer
    end
    change_table :videos do |f|
      f.remove :user_voted
      f.column :user_voted, :integer
    end
    add_column :comments, :users_voted, :text, array:true, null:false, default: []
  	add_column :comments, :users_voted_type, :text, array:true, null:false, default: []

  	add_column :replies, :users_voted, :text, array:true, null:false, default: []
  	add_column :replies, :users_voted_type, :text, array:true, null:false, default: []

	add_column :news_posts, :users_voted_type, :text, array:true, null:false, default: []
  	add_column :videos, :users_voted_type, :text, array:true, null:false, default: []
  end

  def self.down
  	change_table :news_posts do |t|
      t.remove :user_voted
      t.column :user_voted, :boolean, null:false, default:false
    end
    change_table :videos do |f|
      f.remove :user_voted
      f.column :user_voted, :boolean, null:false, default:false
    end
  end

end
