class AddTimestampsToNotifications < ActiveRecord::Migration[5.0]
   def self.up 
        change_table :notifications do |t|
            t.timestamps
        end
        add_column :news_posts, :hostname, :string
        add_column :news_posts, :secure_link, :boolean
        add_column :news_posts, :teaser, :string
        add_column :news_posts, :extras, :jsonb
        add_column :songs, :extras, :jsonb
        add_column :videos, :extras, :jsonb
        add_column :products, :extras, :jsonb
        add_column :songs, :link_artwork, :string
        add_column :videos, :link_artwork, :string
    end
    def self.down
        remove_column :notifications, :created_at
        remove_column :notifications, :updated_at
        remove_column :news_posts, :hostname
        remove_column :news_posts, :secure_link
        remove_column :news_posts, :teaser
        remove_column :news_posts, :extras
        remove_column :songs, :extras
        remove_column :videos, :extras
        remove_column :products, :extras
        remove_column :songs, :other_link
        remove_column :songs, :other_art
        remove_column :videos, :other_link
        remove_column :videos, :other_art
        remove_column :songs, :link_artwork
        remove_column :videos, :link_artwork
    end
end
