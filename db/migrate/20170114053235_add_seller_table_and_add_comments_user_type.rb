class AddSellerTableAndAddCommentsUserType < ActiveRecord::Migration[5.0]
  def change
    create_table :sellers do |t|
      t.integer :user_id
      t.jsonb :sales, null:false, default:'{}'
      t.text :new_sales, array:true, null:false, default:[]
      t.integer :total_sales, null:false, default:0
      t.integer :total_dollar, precision: 12, scale: 2, null:false, default:0.00
      t.integer :total_taxed, precision: 12, scale: 2, null:false, default:0.00
    end
    add_column :orders, :sellers_notified, :boolean, null:false, default:false
    add_column :comments, :admin, :boolean, null:false, default:false
    add_column :comments, :seller, :boolean, null:false, default:false
    add_column :comments, :submitter, :boolean, null:false, default:false
    add_column :products, :seller_id, :integer
    add_column :users, :selled_id, :integer
    add_column :songs, :time_ago, :string
    add_column :videos, :time_ago, :string
    add_column :news_posts, :time_ago, :string
    add_column :products, :time_ago, :string
    add_column :comments, :time_ago, :string
    add_column :comments, :styled, :boolean, null:false, default:false
    add_column :orders, :firstname, :string, null:false, default:''
    add_column :orders, :lastname, :string, null:false, default:''
    add_column :orders, :address, :string, null:false, default:''
    add_column :orders, :zip, :string, null:false, default:''
    add_column :orders, :address_two, :string
    add_column :orders, :city, :string, null:false, default:''
    add_column :orders, :state, :string, null:false, default:''
    change_table :orders do |t|
        t.timestamps
    end
  end
end
