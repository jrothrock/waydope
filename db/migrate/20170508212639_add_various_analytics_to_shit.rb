class AddVariousAnalyticsToShit < ActiveRecord::Migration[5.0]
  def change
    add_column :news_posts, :total_views, :integer, null:false, default:0
    add_column :songs, :total_views, :integer, null:false, default:0
    add_column :videos, :total_views, :integer, null:false, default:0
    add_column :products, :total_views, :integer, null:false, default:0

    add_column :songs, :total_plays, :integer, null:false, default:0
    add_column :videos, :total_plays, :integer, null:false, default:0

    add_column :news_posts, :views, :jsonb, null:false, default:'{}'
    add_column :songs, :views, :jsonb, null:false, default:'{}'
    add_column :videos, :views, :jsonb, null:false, default:'{}'
    add_column :products, :views, :jsonb, null:false, default:'{}'


    add_column :news_posts, :user_views, :integer, null:false, default:0
    add_column :songs, :user_views, :integer, null:false, default:0
    add_column :videos, :user_views, :integer, null:false, default:0
    add_column :products, :user_views, :integer, null:false, default:0

    add_column :news_posts, :guest_views, :integer ,null:false, default:0
    add_column :songs, :guest_views, :integer ,null:false, default:0
    add_column :videos, :guest_views, :integer ,null:false, default:0
    add_column :products, :guest_views, :integer ,null:false, default:0

    add_column :songs, :guest_plays, :integer, null:false, default:0
    add_column :videos, :guest_plays, :integer, null:false, default:0

    add_column :songs, :user_plays, :integer, null:false, default:0
    add_column :videos, :user_plays, :integer, null:false, default:0

    add_column :news_posts, :views_ip, :jsonb, null:false, default:'{}'
    add_column :songs, :views_ip, :jsonb, null:false, default:'{}'
    add_column :videos, :views_ip, :jsonb, null:false, default:'{}'
    add_column :products, :views_ip, :jsonb, null:false, default:'{}'

    add_column :users, :ips, :jsonb, null:false, default:'{}'

    add_column :songs, :plays, :jsonb, null:false, default:'{}'
    add_column :videos, :plays, :jsonb, null:false, default:'{}'

    add_column :songs, :plays_ip, :jsonb, null:false, default:'{}'
    add_column :videos, :plays_ip, :jsonb, null:false, default:'{}'

    add_column :users, :news_posts_viewed, :jsonb, null:false, default:'{}'
    add_column :users, :songs_viewed, :jsonb, null:false, default:'{}'
    add_column :users, :videos_viewed, :jsonb, null:false, default:'{}'
    add_column :users, :apparel_viewed, :jsonb, null:false, default:'{}'
    add_column :users, :technology_viewed, :jsonb, null:false, default:'{}'

    add_column :news_posts, :human_votes, :jsonb, null:false, default:'{}'
    add_column :songs, :human_votes, :jsonb, null:false, default:'{}'
    add_column :videos, :human_votes, :jsonb, null:false, default:'{}'
    add_column :products, :human_votes, :jsonb, null:false, default:'{}'
    add_column :comments, :human_votes, :jsonb, null:false, default:'{}'

    add_column :news_posts, :human_votes_count, :integer, null:false, default:0
    add_column :songs, :human_votes_count, :integer, null:false, default:0
    add_column :videos, :human_votes_count, :integer, null:false, default:0
    add_column :products, :human_votes_count, :integer, null:false, default:0
    add_column :comments, :human_votes_count, :integer, null:false, default:0

    add_column :news_posts, :human_average_vote, :integer, null:false, default:0
    add_column :news_posts, :human_upvotes, :integer, null:false, default:0
    add_column :news_posts, :human_downvotes, :integer, null:false, default:0

    add_column :songs, :human_average_vote, :integer, null:false, default:0
    add_column :songs, :human_upvotes, :integer, null:false, default:0
    add_column :songs, :human_downvotes, :integer, null:false, default:0
    
    add_column :videos, :human_average_vote, :integer, null:false, default:0
    add_column :videos, :human_upvotes, :integer, null:false, default:0
    add_column :videos, :human_downvotes, :integer, null:false, default:0

    add_column :products, :human_average_vote, :integer, null:false, default:0
    add_column :products, :human_upvotes, :integer, null:false, default:0
    add_column :products, :human_downvotes, :integer, null:false, default:0

    add_column :comments, :human_average_vote, :integer, null:false, default:0
    add_column :comments, :human_upvotes, :integer, null:false, default:0
    add_column :comments, :human_downvotes, :integer, null:false, default:0

    add_column :songs, :human_likes, :jsonb, null:false, default:'{}'
    add_column :videos, :human_likes, :jsonb, null:false, default:'{}'
    add_column :products, :human_likes, :jsonb, null:false, default:'{}'

    add_column :songs, :human_likes_count, :integer, null:false, default:0
    add_column :videos, :human_likes_count, :integer, null:false, default:0
    add_column :products, :human_likes_count, :integer, null:false, default:0
    
    add_column :news_posts, :human_ratings, :jsonb, null:false, default:'{}'
    add_column :songs, :human_ratings, :jsonb, null:false, default:'{}'
    add_column :videos, :human_ratings, :jsonb, null:false, default:'{}'
    add_column :products, :human_ratings, :jsonb, null:false, default:'{}'

    add_column :news_posts, :human_average_rating, :integer, null:false, default:0
    add_column :songs, :human_average_rating, :integer, null:false, default:0
    add_column :videos, :human_average_rating, :integer, null:false, default:0
    add_column :products, :human_average_rating, :integer, null:false, default:0

    add_column :news_posts, :human_ratings_count, :integer, null:false, default:0
    add_column :songs, :human_ratings_count, :integer, null:false, default:0
    add_column :videos, :human_ratings_count, :integer, null:false, default:0
    add_column :products, :human_ratings_count, :integer, null:false, default:0

    add_column :songs, :human_advanced_rating, :integer, null:false, default:0
    add_column :songs, :human_advanced_rating_count, :integer, null:false, default:0
    add_column :songs, :human_average_simplified_rating, :integer, null:false, default:0
    add_column :songs, :human_average_simplified_rating_count, :integer, null:false, default:0
    add_column :songs, :human_average_lyrics_rating, :integer, null:false, default:0
    add_column :songs, :human_average_lyrics_rating_count, :integer, null:false, default:0
    add_column :songs, :human_average_production_rating, :integer, null:false, default:0
    add_column :songs, :human_average_production_rating_count, :integer, null:false, default:0
    add_column :songs, :human_average_originality_rating, :integer, null:false, default:0
    add_column :songs, :human_average_originality_rating_count, :integer, null:false, default:0

    add_column :songs, :advanced_ratings, :jsonb,null:false, default:'{}'
    add_column :songs, :human_advanced_ratings, :jsonb, null:false, default:'{}'

    add_column :users, :durations, :jsonb, null:false, default:'{}'
    add_column :users, :average_duration, :integer, null:false, default:'{}'

    add_column :news_posts, :durations, :jsonb, null:false, default:'{}'
    add_column :songs, :durations, :jsonb, null:false, default:'{}'
    add_column :videos, :durations, :jsonb, null:false, default:'{}'
    add_column :products, :durations, :jsonb, null:false, default:'{}'

    add_column :news_posts, :durations_ip, :jsonb, null:false, default:'{}'
    add_column :songs, :durations_ip, :jsonb, null:false, default:'{}'
    add_column :videos, :durations_ip, :jsonb, null:false, default:'{}'
    add_column :products, :durations_ip, :jsonb, null:false, default:'{}'
     
    add_column :news_posts, :average_duration, :integer, null:false, default:'{}'
    add_column :songs, :average_duration, :integer, null:false, default:'{}'
    add_column :videos, :average_duration, :integer, null:false, default:'{}'
    add_column :products, :average_duration, :integer, null:false, default:'{}'

    create_table :cart_abandonment do |t|
      t.integer :stage, null:false, default:0
      t.boolean :abandoned, null:false, default:false
      t.integer :duration, null:false, default:false
      t.string :cart_id
      t.string :user_id
      t.string :ip_address
      t.jsonb :stage_duration, null:false, default: '{}'
      t.timestamps
    end

    create_table :tracking do |t|
      t.integer "user_id"
      t.integer "last_pageviews"
      t.integer "average_pageviews"
      t.json "average_pageviews"
      t.integer "last_duration"
      t.integer "average_duration"
      t.jsonb "durations"
      t.string "uuid"
      t.string "last_country"
      t.jsonb "countries"
      t.string "last_state"
      t.jsonb "states"
      t.string "last_city"
      t.jsonb "cities"
      t.string "last_ip_address"
      t.jsonb "ip_addresses"
      t.string "last_user_agent"
      t.jsonb "user_agents"
      t.jsonb "time_stamps"
      t.integer "mobile_visits"
      t.integer "non_mobile_vists"
      t.string "last_referer"
      t.datetime "last_visit"
      t.jsonb "visits"
      t.jsonb "referers"
      t.jsonb "mobile_duration"
      t.jsonb "non_mobile_duration"
      t.timestamps
    end

    # drop_table :impressions
    
    create_table :impressions do |t|
      t.jsonb "countries"
      t.integer "new_sessions"
      t.datetime "date"
      t.integer "visitors"
      t.integer "uniques"
      t.jsonb "countries_unique"
      t.jsonb "countries_pageviews"
      t.integer "pageviews"
      t.integer "mobile"
      t.integer "non_mobile"
      t.jsonb "countries_mobile"
      t.jsonb "countries_non_mobile"
      t.integer "bounced"
      t.float "average_pageviews"
      t.float "average_pageviews_mobile"
      t.float "average_pageviews_non_mobile"
      t.jsonb "countries_bounced"
      t.jsonb "durations"
      t.integer "average_duration"
      t.jsonb "durations_mobile"
      t.integer "average_duration_mobile"
      t.jsonb "durations_non_mobile"
      t.integer "average_duration_non_mobile"
      t.jsonb "referers"
      t.jsonb "user_agents"
      t.jsonb "trackers"
    end

    add_column :impressions, :duration, :integer, null:false, defaut:0
    
    add_column :users, :songs_played, :jsonb, null:false, default:'{}'
    add_column :users, :videos_played, :jsonb, null:false, default:'{}'

    add_column :users, :trackers, :jsonb, null:false, default:'{}'

    add_column :users, :news_posts_duration, :jsonb, null:false, default:'{}'
    add_column :users, :songs_duration, :jsonb, null:false, default:'{}'
    add_column :users, :videos_duration, :jsonb, null:false, default:'{}'
    add_column :users, :products_duration, :jsonb, null:false, default:'{}'

    add_column :users, :news_post_average_duration, :integer, null:false, default:0
    add_column :users, :songs_average_duration, :integer, null:false, default:0
    add_column :users, :videos_average_duration, :integer, null:false, default:0
    add_column :users, :products_average_duration, :integer, null:false, default:0

    add_column :users, :consecutive_days, :jsonb, null:false, default:'{}'

    add_column :users, :average_consecutive_days, :integer, null:false, default:0

    add_column :users, :days_visited, :integer, null:false, default:0
    add_column :users, :mobile_vists, :integer, null:false, default:0
    add_column :users, :non_mobile_visits, :integer, null:false, default:0

    add_column :users, :last_visit, :datetime, null:false, default:Time.now
    add_column :users, :last_consecutive_days, :integer, null:false, default:0
    add_column :users, :since_last_visit, :integer

    add_column :users, :last_tracker, :string, null:false, default:''
    # remove_columns :users, :last_login
    add_column :users, :last_duration, :integer, null:false, default:0

    add_column :songs, :user_played, :boolean, null:false, default:false
    add_column :videos, :user_played, :boolean, null:false, default:false

    add_column :news_posts, :user_viewed, :boolean, null:false, default:false
    add_column :songs, :user_viewed, :boolean, null:false, default:false
    add_column :videos, :user_viewed, :boolean, null:false, default:false
    add_column :products, :user_viewed, :boolean, null:false, default:false

    add_column :news_posts, :unique_views, :integer, null:false, default:false
    add_column :songs, :unique_views, :integer, null:false, default:false
    add_column :videos, :unique_views, :integer, null:false, default:false
    add_column :products, :unique_views, :integer, null:false, default:false

    add_column :orders, :zip_checked, :boolean, null:false, default:false
  end
end
