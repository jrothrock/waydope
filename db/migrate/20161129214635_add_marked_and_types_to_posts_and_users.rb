class AddMarkedAndTypesToPostsAndUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :news_posts, :marked, :text, null:false, default:''
    add_column :news_posts, :stripped, :text, null:false, default:''
    add_column :songs, :marked, :text, null:false, default:''
    add_column :songs, :stripped, :text, null:false, default:''
    add_column :videos, :marked, :text, null:false, default:''
    add_column :videos, :stripped, :text, null:false, default:''
    add_column :comments, :marked, :text, null:false, default:''
    add_column :comments, :stripped, :text, null:false, default:''
    add_column :replies, :marked, :text, null:false, default:''
    add_column :replies, :stripped, :text, null:false, default:''

    add_column :users, :moderator, :boolean, null:false, default:false
    add_column :users, :seller, :boolean, null:false, default:false
    add_column :users, :artist, :boolean, null:false, default:false
    add_column :users, :creator, :boolean, null:false, default:false
    add_column :users, :reporter, :boolean, null:false, default:false
    
    remove_column :apparels, :users_voted, :text, array:true, null:false, default:[]
    remove_column :apparels, :users_voted_type, :text, array:true, null:false, default:[]
    remove_column :technologies, :users_voted, :text, array:true, null:false, default:[]
    remove_column :technologies, :users_voted_type, :text, array:true, null:false, default:[]
    remove_column :apparels, :likes, :text, array:true, null:false, default:[]
    remove_column :technologies, :likes, :text, array:true, null:false, default:[]

     add_column :apparels, :votes, :jsonb, null:false, default: '{}'
     add_column :technologies, :votes, :jsonb, null:false, default: '{}'
     add_column :apparels, :likes, :jsonb, null: false, default: '{}'
     add_column :technologies, :likes, :jsonb, null: false, default: '{}'
  end
end
