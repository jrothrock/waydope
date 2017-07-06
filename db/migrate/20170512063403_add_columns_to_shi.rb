class AddColumnsToShi < ActiveRecord::Migration[5.0]
  def change
    add_column :news_posts, :hotness, :float, null:false, default:0.0
    add_column :songs, :hotness, :float, null:false, default:0.0
    add_column :videos, :hotness, :float, null:false, default:0.0
    add_column :products, :hotness, :float, null:false, default:0.0

    remove_column :news_posts, :freshness, :integer, null:false, default:0
    remove_column :songs, :freshness, :integer, null:false, default:0
    remove_column :videos, :freshness, :integer, null:false, default:0
    remove_column :products, :freshness, :integer, null:false, default:0

    add_column :news_posts, :freshness, :float, null:false, default:0.0
    add_column :songs, :freshness, :float, null:false, default:0.0
    add_column :videos, :freshness, :float, null:false, default:0.0
    add_column :products, :freshness, :float, null:false, default:0.0
    remove_column :users, :votes, :text, array:true, null:false, default:[]
    add_column :users, :news_votes, :jsonb, null:false, default:'{}'
    add_column :users, :music_votes, :jsonb, null:false, default:'{}'
    add_column :users, :videos_votes, :jsonb, null:false, default:'{}'
    add_column :users, :apparel_votes, :jsonb, null:false, default:'{}'
    add_column :users, :technology_votes, :jsonb, null:false, default:'{}'

    remove_column :impressions, :duration, :integer, null:false, default:0
    add_column :impressions, :duration, :integer
    add_column :impressions, :cities_unique, :jsonb, null:false, default:'{}'
    add_column :impressions, :states_unique, :jsonb, null:false, default:'{}'
    rename_table :tracking, :trackers
    add_column :trackers, :pageviews, :jsonb, null:false, default:'{}'
    add_column :users, :pageviews, :jsonb, null:false, default:'{}'
    add_column :users, :average_pageviews, :integer, null:false, default:0
    add_column :users, :last_pageviews, :integer, null:false, default:0
    add_column :impressions, :bounced_mobile, :integer, default:0
    add_column :impressions, :bounced_non_mobile, :integer, default:0
    add_column :impressions, :average_durations_countries, :jsonb, default: '{}'
    add_column :impressions, :average_pageviews_countries, :jsonb, default:'{}'
    add_column :impressions, :pageviews_mobile, :jsonb, default:'{}'
    add_column :impressions, :pageviews_nonmobile, :jsonb, default:'{}'
    remove_column :impressions, :average_duration
    add_column :impressions, :average_duration, :integer, default:0
  end
end