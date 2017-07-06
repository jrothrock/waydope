class AddSortingForProducts < ActiveRecord::Migration[5.0]
  def change
    add_column :products, :sorted, :boolean, null:false, default:false
    add_column :products, :sorting, :text, array:true, null:false, default:[]
    add_column :news_posts, :title_change, :integer, null:false, default: 0
    add_column :songs, :title_change, :integer, null:false, default: 0
    add_column :videos, :title_change, :integer, null:false, default: 0
    add_column :products, :title_change, :integer, null:false, default: 0
    add_column :notifications, :time_ago, :string
    add_column :comments, :uid, :string, null:false, default: ''
    remove_column :orders, :total, :integer, null:false, default: 0
    remove_column :orders, :sub_total, :integer, null:false, default: 0
    remove_column :orders, :shipping, :integer, null:false, default: 0
    remove_column :orders, :tax, :integer, null:false, default: 0
    add_column :orders, :total, :decimal,  precision: 8, scale: 2, null:false, default:0.00
    add_column :orders, :sub_total, :decimal,  precision: 8, scale: 2, null:false, default:0.00
    add_column :orders, :shipping, :decimal,  precision: 8, scale: 2, null:false, default:0.00
    add_column :orders, :tax, :decimal,  precision: 8, scale: 2, null:false, default:0.00
    add_column :orders, :tax_rate, :decimal,  precision: 8, scale: 4, null:false, default:0.00
    add_column :orders, :taxes, :jsonb, null:false, default:'{}'
    add_column :users, :verified_email, :boolean, null:false, default:false
    add_column :users, :email_token, :string
    add_column :users, :email_time_stamp, :datetime
    remove_index :users, :name => 'index_users_on_email', :unique => true 
    add_index :users, :email
  end
end
