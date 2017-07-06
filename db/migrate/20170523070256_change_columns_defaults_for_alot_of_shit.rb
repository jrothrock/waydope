class ChangeColumnsDefaultsForAlotOfShit < ActiveRecord::Migration[5.0]
  def change
    # change_column_default(:cart_abandonment, :stage_duration, {})
    # change_column_default(:comments, :votes, {})
    # change_column_default(:comments, :votes_ip, {})
    # change_column_default(:comments, :human_votes, {})
    # change_column_default(:impressions, :cities_unique, {})
    # change_column_default(:impressions, :states_unique, {})
    # change_column_default(:impressions, :average_durations_countries, {})
    # change_column_default(:impressions, :average_pageviews_countries, {})
    # change_column_default(:impressions, :pageviews_mobile, {})
    # change_column_default(:impressions, :pageviews_nonmobile, {})
    # change_column_default(:impressions, :ips, {})
    # change_column_default(:news_posts, :ratings, {})
    # change_column_default(:news_posts, :votes, {})
    # change_column_default(:news_posts, :votes_ip, {})
    # change_column_default(:news_posts, :ratings_ip, {})
    # change_column_default(:news_posts, :likes_ip, {})
    # change_column_default(:news_posts, :views, {})
    # change_column_default(:news_posts, :views_ip, {})
    # change_column_default(:news_posts, :human_votes, {})
    # change_column_default(:news_posts, :human_ratings, {})
    # change_column_default(:news_posts, :durations, {})
    # change_column_default(:news_posts, :durations_ip, {})
    # remove_column :news_posts, :likes, :text, array:true, null:false, default:[]
    # add_column :news_posts, :likes, :jsonb, default:{}
    # add_column :news_posts, :properties, :jsonb, default:{}
    # change_column_default(:orders, :quantities, {})
    # change_column_default(:orders, :taxes, {})
    # change_column_default(:orders, :shipping_confirmations, {})
    # change_column_default(:orders, :shipped, {})
    # change_column_default(:orders, :totals, {})
    # change_column_default(:orders, :shippings, {})
    # change_column_default(:orders, :sub_totals, {})
    # change_column_default(:orders, :properties, {})
    # change_column_default(:products, :properties, {})
    # change_column_default(:products, :votes, {})
    # change_column_default(:products, :likes, {})
    # change_column_default(:products, :ratings, {})
    # change_column_default(:products, :fit, {})
    # change_column_default(:products, :purchasers, {})
    # change_column_default(:products, :votes_ip, {})
    # change_column_default(:products, :ratings_ip, {})
    # change_column_default(:products, :likes_ip, {})
    # change_column_default(:products, :views, {})
    # change_column_default(:products, :views_ip, {})
    # change_column_default(:products, :human_votes, {})
    # change_column_default(:products, :human_likes, {})
    # change_column_default(:products, :human_ratings, {})
    # change_column_default(:products, :durations, {})
    # change_column_default(:products, :durations_ip, {})
    # change_column_default(:sellers, :sales, {})
    # change_column_default(:songs, :likes, {})
    # change_column_default(:songs, :ratings, {})
    # change_column_default(:songs, :votes, {})
    # change_column_default(:songs, :votes_ip, {})
    # change_column_default(:songs, :ratings_ip, {})
    # change_column_default(:songs, :likes_ip, {})
    # change_column_default(:songs, :download_users, {})
    # change_column_default(:songs, :download_ips, {})
    # change_column_default(:songs, :views, {})
    # change_column_default(:songs, :views_ip, {})
    # change_column_default(:songs, :plays, {})
    # change_column_default(:songs, :plays_ip, {})
    # change_column_default(:songs, :human_votes, {})
    # change_column_default(:songs, :human_likes, {})
    # change_column_default(:songs, :human_ratings, {})
    # change_column_default(:songs, :advanced_ratings, {})
    # change_column_default(:songs, :human_advanced_ratings, {})
    # change_column_default(:songs, :durations, {})
    # change_column_default(:songs, :durations_ip, {})
    # add_column :songs, :properties, :jsonb, default:{}
    # change_column_default(:trackers, :pageviews, {})
    # change_column_default(:users, :songs, {})
    # change_column_default(:users, :videos, {})
    # change_column_default(:users, :news_posts, {})
    # change_column_default(:users, :apparel, {})
    # change_column_default(:users, :technology, {})
    # change_column_default(:users, :song_downloads, {})
    # change_column_default(:users, :ips, {})
    # change_column_default(:users, :news_posts_viewed, {})
    # change_column_default(:users, :songs_viewed, {})
    # change_column_default(:users, :videos_viewed, {})
    # change_column_default(:users, :apparel_viewed, {})
    # change_column_default(:users, :technology_viewed, {})
    # change_column_default(:users, :durations, {})
    # change_column_default(:users, :songs_played, {})
    # change_column_default(:users, :videos_played, {})
    # change_column_default(:users, :trackers, {})
    # change_column_default(:users, :news_posts_duration, {})
    # change_column_default(:users, :songs_duration, {})
    # change_column_default(:users, :videos_duration, {})
    # change_column_default(:users, :products_duration, {})
    # change_column_default(:users, :consecutive_days, {})
    # change_column_default(:users, :last_duration, {})
    # change_column_default(:users, :news_votes, {})
    # change_column_default(:users, :music_votes, {})
    # change_column_default(:users, :videos_votes, {})
    # change_column_default(:users, :apparel_votes, {})
    # change_column_default(:users, :technology_votes, {})
    # change_column_default(:users, :pageviews, {})
    # change_column_default(:users, :song_plays, {})
    # change_column_default(:users, :video_plays, {})
    # remove_column :videos, :songs, :jsonb, null:false, default:'{}'
    # change_column_default(:videos, :likes, {})
    # change_column_default(:videos, :ratings, {})
    # change_column_default(:videos, :votes, {})
    # change_column_default(:videos, :votes_ip, {})
    # change_column_default(:videos, :ratings_ip, {})
    # change_column_default(:videos, :likes_ip, {})
    # change_column_default(:videos, :download_users, {})
    # change_column_default(:videos, :download_ips, {})
    # change_column_default(:videos, :download_url, "")
    # change_column_default(:videos, :views, {})
    # change_column_default(:videos, :views_ip, {})
    # change_column_default(:videos, :plays, {})
    # change_column_default(:videos, :plays_ip, {})
    # change_column_default(:videos, :human_votes, {})
    # change_column_default(:videos, :human_likes, {})
    # change_column_default(:videos, :human_ratings, {})
    # change_column_default(:videos, :durations, {})
    # change_column_default(:videos, :durations_ip, {})
    add_column :videos, :properties, :jsonb, null:false, default:{}
    # add_column :users, :comment_votes, :jsonb, null:false, default:{}
    # add_column :orders, :purchased_at, :datetime
    # add_column :orders, :tracker_sent, :datetime
    # add_column :orders, :tracker_updated, :datetime
    # add_column :products, :old_properties, :jsonb, default:{}
    # add_column :products, :max_price, :decimal, precision: 8, scale: 2, default: 0.00
    # add_column :products, :min_price, :decimal, precision: 8, scale: 2, default: 0.00
    # add_column :videos, :human_average_simplified_rating, :integer, null:false, default:0
    # add_column :videos, :human_average_simplified_rating_count, :integer, null:false, default:0
    
    # add_column :news_posts, :human_average_simplified_rating, :integer, null:false, default:0
    # add_column :news_posts, :human_average_simplified_rating_count, :integer, null:false, default:0

    # add_column :products, :human_average_simplified_rating, :integer, null:false, default:0
    # add_column :products, :human_average_simplified_rating_count, :integer, null:false, default:0
    # add_column :songs, :human_average_advanced_rating, :integer, null:false, default:0
    # add_column :songs, :human_average_advanced_rating_count, :integer, null:false, default:0
    # remove_column :users, :last_duration, :integer, null:false
    # add_column :users, :last_duration, :integer, default:0
    # add_column :videos, :uuid, :string, null:false, default:''
    # add_column :news_posts, :uuid, :string, null:false, default:''
    # add_column :songs, :uuid, :string, null:false, default:''
    # add_column :products, :uuid, :string, null:false, default:''
    # remove_column :comments, :uid, :string, null:false, default:''
    # add_column :comments, :uuid, :string, null:false, default:''
    # remove_index :comments, name:"index_comments_on_commentable_type_and_commentable_id"
    # remove_column :comments, :commentable_id
    # add_column :comments, :commentable_uuid, :string, null:false, default:''
    # add_index :comments, [:commentable_type, :commentable_uuid]
    # remove_column :comments, :parent_id, :integer, null:false, default:0
    # add_column :comments, :parent_uuid, :string, default:''
    # add_column :users, :seller_stage, :integer, null:false, default:0
    # add_column :users, :stripe_id, :string, default:''
    # add_column :users, :is_business, :boolean, null:false, default:false
    # add_column :users, :business_name, :string, default:''
    # add_column :users, :business_ein, :string, default:''
    # add_column :users, :info_stage, :integer, null:false, default:0
    # add_column :users, :has_paypal, :boolean, default:false
    # add_column :users, :country,:string,default:''
    # add_column :users, :dob, :datetime
    # add_timestamps(:photos)
    # add_column :photos, :uuid, :string
    # add_column :orders, :paid_with, :string, default:''
    # add_column :orders, :stripe_payment_id, :string, default:''
    # add_column :orders, :stripe_payout_ids, :jsonb, default:{}
    # add_column :orders, :paypal_payment_id, :string, default:''
    # add_column :orders, :paypal_payouts_id, :string, default:''
    # add_column :products, :waydope, :boolean, default:false
    # add_column :products, :email, :string, default:''
    # add_column :products, :stripe_id, :string, default:''
    # remove_index :photos, name:"index_photos_on_photoable_type_and_photoable_id"
    # remove_column :photos, :photoable_id, :integer
    

    # bullshit how you can only use ...able_id in polymorephic associations. No ...able_uuid...

    # add_column :photos, :photoable_id, :integer
    # add_index :photos, [:photoable_type, :photoable_id]
    # remove_column :bot_queue, :post_id, :integer
    # add_column :bot_queue, :post_id, :string
    # remove_column :bot_queue, :reply_to, :integer
    # add_column :bot_queue, :reply_to, :string, default:''
    remove_column :bot_queue, :reply_id, :integer
    add_column :bot_queue, :reply_id, :string
  end
end
