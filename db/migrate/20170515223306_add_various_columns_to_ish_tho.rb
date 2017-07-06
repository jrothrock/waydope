class AddVariousColumnsToIshTho < ActiveRecord::Migration[5.0]
  def change
    add_column :news_posts, :removed, :boolean
    add_column :songs, :removed, :boolean
    add_column :videos, :removed, :boolean
    add_column :products, :removed, :boolean
    remove_column :users, :average_duration, :integer
    add_column :users, :average_duration, :integer, default:0
    add_column :songs, :store_url, :string
    add_column :songs, :file_name, :string
  end
end