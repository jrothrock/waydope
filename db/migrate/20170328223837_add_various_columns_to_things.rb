class AddVariousColumnsToThings < ActiveRecord::Migration[5.0]
  def change
    add_column :orders, :email, :string
    remove_column :orders, :shipping_confirmation, :text, array:true,null:false, default:[]
    add_column :orders, :shipping_confirmations, :jsonb, null:false, default:'{}'
    add_column :news_posts, :worked, :boolean, null:false, default:false
    remove_column :users, :apparel, :text, array:true, null:false, default:[]
    remove_column :users, :technology, :text, array:true, null:false, default:[]
    add_column :users, :apparel, :jsonb, null:false, default:'{}'
    add_column :users, :technology, :jsonb, null:false, default:'{}'
    remove_column :users, :apparels, :jsonb, null:false, default:'{}'
    remove_column :users, :technologies, :jsonb, null:false, default:'{}'
    remove_column :sellers, :total_sales, :integer, null:false, default:0
    remove_column :sellers, :total_dollar, :integer, null:false, default:0
    remove_column :sellers, :total_taxed, :integer, null:false, default:0
    add_column :sellers, :total, :integer, null:false, default:0
    add_column :sellers, :total_sales, :decimal,  precision: 8, scale: 2, null:false, default:0.00
    add_column :sellers, :total_sub, :decimal,  precision: 8, scale: 2, null:false, default:0.00
    add_column :sellers, :total_tax, :decimal,  precision: 8, scale: 2, null:false, default:0.00
    add_column :sellers, :total_shipping, :decimal,  precision: 8, scale: 2, null:false, default:0.00
    add_column :notifications, :quantity, :integer, null:false, default:0
    add_column :orders, :shipped, :jsonb, null:false, default:'{}'
    remove_column :songs, :link_link, :string 
    add_column :songs, :original_link, :string, null:false, default:''
    add_column :videos, :original_link, :string, null:false, default:''
    add_column :orders, :totals, :jsonb, null:false, default:'{}'
    add_column :orders, :shippings, :jsonb, null:false, default:'{}'
    add_column :orders, :sub_totals, :jsonb, null:false, default:'{}'
    add_column :board_categories, :new_posts, :boolean, null:false, default:false
    add_column :music_genres, :new_posts, :boolean, null:false, default:false
    add_column :video_categories, :new_posts, :boolean, null:false, default:false
    add_column :users, :post_karma, :integer, null:false, default:0
    add_column :news_posts, :nsfw, :boolean,null:false, default:false
    add_column :songs, :upload_artwork_url_nsfw, :boolean,null:false, default:false
    add_column :videos, :upload_artwork_url_nsfw, :boolean,null:false, default:false
    add_column :products, :upload_urls_nsfw, :text,array:true, null:false, default:[]
    add_column :songs, :featured, :boolean, null:false, default:false
    add_column :news_posts, :featured, :boolean, null:false, default:false
    add_column :videos, :featured, :boolean, null:false, default:false
    add_column :news_posts, :nsfw_flag, :boolean, null:false, default:false
    add_column :products, :nsfw_flag, :boolean, null:false, default:false
    add_column :users, :hide_nsfw, :boolean, null:false, default:false
    add_column :users, :show_nsfw, :boolean, null:false, default:false
    add_column :products, :nsfw, :boolean, null:false, default:false
    add_column :products, :upload_artwork_url_nsfw_ids, :text, array:true, null:false, default:[]
    add_column :products, :checked, :boolean, null:false, default:false
    add_column :news_posts, :checked, :boolean, null:false, default:false
    add_column :songs, :checked, :boolean, null:false, default:false
    add_column :videos, :checked, :boolean, null:false, default:false
    add_column :comments, :checked, :boolean, null:false, default:false
    add_column :songs, :nsfw_flag, :boolean, null:false, default:false
    add_column :videos, :nsfw_flag, :boolean, null:false, default:false
    add_column :songs, :nsfw, :boolean, null:false, default:false
    add_column :videos, :nsfw, :boolean, null:false, default:false
    add_column :songs, :background, :string, null:false, default:false
    add_column :songs, :reported, :boolean, null:false, default:false
    add_column :videos, :reported, :boolean, null:false, default:false
    add_column :comments, :reported, :boolean, null:false, default:false
    add_column :news_posts, :reported, :boolean, null:false, default:false
    add_column :products, :reported, :boolean, null:false, default:false

    remove_column :news_posts, :flag_users, :text, array:true, null:false, default:[]
    remove_column :news_posts, :user_flagged, :boolean, null:false, default:false
    remove_column :news_posts, :flagged_type, :text, array:true, null:false, default:[]
    remove_column :news_posts, :flag_count, :integer, null:false, default:0
    add_column :news_posts, :report_users, :text,array:true, null:false, default:[]
    add_column :news_posts, :user_reported, :boolean, null:false, default:false
    add_column :news_posts, :report_types, :text, array:true,null:false, default:[]
    add_column :news_posts, :report_count, :integer, null:false, default:0
    add_column :news_posts, :report_checked,:boolean,null:false, default:false

    remove_column :songs, :flag_users, :text, array:true, null:false, default:[]
    remove_column :songs, :user_flagged, :boolean, null:false, default:false
    remove_column :songs, :flagged_type, :text, array:true, null:false, default:[]
    remove_column :songs, :flag_count, :integer, null:false, default:0
    add_column :songs, :report_users, :text,array:true, null:false, default:[]
    add_column :songs, :user_reported, :boolean, null:false, default:false
    add_column :songs, :report_types, :text, array:true,null:false, default:[]
    add_column :songs, :report_count, :integer, null:false, default:0
    add_column :songs, :report_checked,:boolean,null:false, default:false

    remove_column :videos, :flag_users, :text, array:true, null:false, default:[]
    remove_column :videos, :user_flagged, :boolean, null:false, default:false
    remove_column :videos, :flagged_type, :text, array:true, null:false, default:[]
    remove_column :videos, :flag_count, :integer, null:false, default:0
    add_column :videos, :report_users, :text,array:true, null:false, default:[]
    add_column :videos, :user_reported, :boolean, null:false, default:false
    add_column :videos, :report_types, :text, array:true,null:false, default:[]
    add_column :videos, :report_count, :integer, null:false, default:0
    add_column :videos, :report_checked,:boolean,null:false, default:false

    remove_column :products, :flag_users, :text, array:true, null:false, default:[]
    remove_column :products, :user_flagged, :boolean, null:false, default:false
    remove_column :products, :flagged_type, :text, array:true, null:false, default:[]
    remove_column :products, :flag_count, :integer, null:false, default:0
    add_column :products, :report_users, :text,array:true, null:false, default:[]
    add_column :products, :user_reported, :boolean, null:false, default:false
    add_column :products, :report_types, :text, array:true,null:false, default:[]
    add_column :products, :report_count, :integer, null:false, default:0
    add_column :products, :report_checked,:boolean,null:false, default:false

    remove_column :comments, :flag_users, :text, array:true, null:false, default:[]
    remove_column :comments, :user_flagged, :boolean, null:false, default:false
    remove_column :comments, :flagged_type, :text, array:true, null:false, default:[]
    remove_column :comments, :flag_count, :integer, null:false, default:0
    add_column :comments, :report_users, :text,array:true, null:false, default:[]
    add_column :comments, :user_reported, :boolean, null:false, default:false
    add_column :comments, :report_types, :text, array:true,null:false, default:[]
    add_column :comments, :report_count, :integer, null:false, default:0
    add_column :comments, :report_checked,:boolean,null:false, default:false

    remove_column :users, :flags_type, :text, array:true, null:false, default:[]
    remove_column :users, :flags, :text, array:true, null:false, default:[]
    remove_column :users, :flags_foul, :text, array:true, null:false, default:[]
    remove_column :users, :user_flagged, :boolean, null:false, default:false
    add_column :users, :report_types, :text, array:true, null:false, default:[]
    add_column :users, :reports, :text, array:true, null:false, default:[]
    add_column :users, :flags_foul, :text, array:true, null:false, default:[]
    add_column :users, :user_reported, :boolean,null:false, default:false
  end
end
