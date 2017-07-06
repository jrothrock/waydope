class ChangeArraysToJsonb < ActiveRecord::Migration[5.0]
  def change
    remove_column :songs, :likes, :text, array:true, null:false, default:[]
    remove_column :users, :songs, :text, array:true, null:false, default:[]
    remove_column :videos, :likes, :text, array:true, null:false, default:[]
    remove_column :users, :videos, :text, array:true, null:false, default:[]
    remove_column :users, :news_posts, :text, array:true, null:false, default:[]
    remove_column :songs, :ratings, :text, array:true, null:false, default:[]
    remove_column :songs, :ratings_user, :text, array:true, null:false, default:[]
    remove_column :news_posts, :ratings, :text, array:true, null:false, default:[]
    remove_column :news_posts, :ratings_user, :text, array:true, null:false, default:[]
    remove_column :videos, :ratings, :text, array:true, null:false, default:[]
    remove_column :videos, :ratings_user, :text, array:true, null:false, default:[]
    remove_column :news_posts, :users_voted, :text, array:true, null:false, default:[]
    remove_column :news_posts, :users_voted_type, :text, array:true, null:false, default:[]
    remove_column :songs, :users_voted, :text, array:true, null:false, default:[]
    remove_column :songs, :users_voted_type, :text, array:true, null:false, default:[]
    remove_column :videos, :users_voted, :text, array:true, null:false, default:[]
    remove_column :videos, :users_voted_type, :text, array:true, null:false, default:[]
    remove_column :comments, :users_voted, :text, array:true, null:false, default:[]
    remove_column :comments, :users_voted_type, :text, array:true, null:false, default:[]
    remove_column :replies, :users_voted, :text, array:true, null:false, default:[]
    remove_column :replies, :users_voted_type, :text, array:true, null:false, default:[]
    remove_column :replies, :vote_count, :integer, null:false, default:0
    remove_column :comments, :vote_count, :integer, null:false, default:0

    add_column :songs, :likes, :jsonb, null: false, default: '{}'
    add_column :videos, :likes, :jsonb, null: false, default: '{}'
    add_column :users, :songs, :jsonb, null: false, default: '{}'
    add_column :users, :videos, :jsonb, null: false, default: '{}'
    add_column :users, :news_posts, :jsonb, null: false, default: '{}'
    add_column :videos, :ratings, :jsonb, null:false, default: '{}'
    add_column :songs, :ratings, :jsonb, null:false, default: '{}'
    add_column :news_posts, :ratings, :jsonb, null:false, default: '{}'
    add_column :news_posts, :votes, :jsonb, null:false, default: '{}'
    add_column :songs, :votes, :jsonb, null:false, default: '{}'
    add_column :videos, :votes, :jsonb, null:false, default: '{}'
    add_column :comments, :votes, :jsonb, null:false, default: '{}'
    add_column :replies, :votes, :jsonb, null:false, default: '{}'
    add_column :replies, :votes_count, :integer, null:false, default:0
    add_column :comments, :votes_count, :integer, null:false, default:0
  end
end
