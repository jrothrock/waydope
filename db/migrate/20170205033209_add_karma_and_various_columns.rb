class AddKarmaAndVariousColumns < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :comment_karma, :integer, null:false, default:0
    add_column :users, :news_karma, :integer, null:false, default:0
    add_column :users, :music_karma, :integer, null:false, default:0
    add_column :users, :videos_karma, :integer, null:false, default:0
    add_column :users, :products_karma, :integer, null:false, default:0
    add_column :users, :gender, :string
    add_column :bot_queue, :group_id, :integer
    add_column :bot_queue, :reply_id, :integer
    rename_column :songs, :average_message_rating, :average_lyrics_rating
    rename_column :songs, :average_message_rating_count, :average_lyrics_rating_count
    remove_column :songs, :average_whinyness_rating, :integer, null:false, default:0
    remove_column :songs, :average_whinyness_rating_count, :integer, null:false, default:0
    add_column :songs, :average_simplified_rating_variance, :integer, null:false, default:0
    add_column :songs, :average_simplified_rating_deviation, :integer, null:false, default:0
    add_column :songs, :average_advanced_rating_variance, :integer, null:false, default:0
    add_column :songs, :average_advanced_rating_deviation, :integer, null:false, default:0 
    add_column :songs, :average_lyrics_rating_variance, :integer, null:false, default:0 
    add_column :songs, :average_rating_variance, :integer, null:false, default: 0
    add_column :songs, :average_rating_deviation, :integer, null:false, default: 0
    add_column :songs, :average_lyrics_rating_deviation, :integer, null:false, default:0 
    add_column :songs, :average_production_rating_variance, :integer, null:false, default:0 
    add_column :songs, :average_production_rating_deviation, :integer, null:false, default:0 
    add_column :songs, :average_originality_rating_variance, :integer, null:false, default:0 
    add_column :songs, :average_originality_rating_deviation, :integer, null:false, default:0 
    add_column :songs, :votes_ip, :jsonb, null:false, default:'{}'
    add_column :news_posts, :votes_ip, :jsonb, null:false, default:'{}'
    add_column :videos, :votes_ip, :jsonb, null:false, default:'{}'
    add_column :products, :votes_ip, :jsonb, null:false, default:'{}'
    add_column :comments, :votes_ip, :jsonb, null:false, default:'{}'
    add_column :songs, :ratings_ip, :jsonb, null:false, default:'{}'
    add_column :news_posts, :ratings_ip, :jsonb, null:false, default:'{}'
    add_column :videos, :ratings_ip, :jsonb, null:false, default:'{}'
    add_column :products, :ratings_ip, :jsonb, null:false, default:'{}'
    add_column :songs, :likes_ip, :jsonb, null:false, default:'{}'
    add_column :news_posts, :likes_ip, :jsonb, null:false, default:'{}'
    add_column :videos, :likes_ip, :jsonb, null:false, default:'{}'
    add_column :products, :likes_ip, :jsonb, null:false, default:'{}'
    add_column :messages, :time_ago, :string
  end
end
