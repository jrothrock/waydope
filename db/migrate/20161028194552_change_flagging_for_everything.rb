class ChangeFlaggingForEverything < ActiveRecord::Migration[5.0]
  def change
  	remove_column :news_posts, :flagged_type, :integer
  	remove_column :songs, :flagged_type, :integer
  	remove_column :videos, :flagged_type, :integer
  	remove_column :comments, :flagged_type, :integer
  	remove_column :replies, :flagged_type, :integer

  	add_column :users, :flags_type, :text, array:true, null:false, default: []
  	add_column :users, :flags, :text, array:true, null:false, default: [] 
  	add_column :users, :flags_foul, :text, array:true, null:false, default: []
  	add_column :users, :user_flagged, :boolean, null:false, default:false
  	add_column :users, :flag_count, :integer, null:false, default:0

  	add_column :news_posts, :flagged_type, :text, array:true, null:false, default:[]
  	add_column :news_posts, :flag_users, :text, array:true, null:false, default:[]
  	add_column :news_posts, :user_flagged, :boolean, null:false, default:false
  	add_column :news_posts, :flag_count, :integer, null:false, default:0

  	add_column :songs, :flagged_type, :text, array:true, null:false, default:[]
  	add_column :songs, :flag_users, :text, array:true, null:false, default:[]
  	add_column :songs, :user_flagged, :boolean, null:false, default:false
  	add_column :songs, :flag_count, :integer, null:false, default:0

  	add_column :videos, :flagged_type, :text, array:true, null:false, default:[]
  	add_column :videos, :flag_users, :text, array:true, null:false, default:[]
  	add_column :videos, :user_flagged, :boolean, null:false, default:false
  	add_column :videos, :flag_count, :integer, null:false, default:0

  	add_column :comments, :flagged_type, :text, array:true, null:false, default:[]
  	add_column :comments, :flag_users, :text, array:true, null:false, default:[]
  	add_column :comments, :user_flagged, :boolean, null:false, default:false
  	add_column :comments, :flag_count, :integer, null:false, default:0

  	add_column :replies, :flagged_type, :text, array:true, null:false, default:[]
  	add_column :replies, :flag_users, :text, array:true, null:false, default:[]
  	add_column :replies, :user_flagged, :boolean, null:false, default:false
  	add_column :replies, :flag_count, :integer, null:false, default:0

  	add_index :news_posts, :flagged
  	add_index :songs, :flagged
  	add_index :videos, :flagged
  	add_index :comments, :flagged
  	add_index :replies, :flagged

  end
end
