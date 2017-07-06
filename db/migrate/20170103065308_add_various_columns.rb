class AddVariousColumns < ActiveRecord::Migration[5.0]
  def change
    add_column :orders, :uuid, :string, null:false, default:''
    remove_column :products, :purchasers, :text, array:true, null:false, default:[]
    add_column :products, :purchasers, :jsonb, null:false, default: '{}'
    add_column :products, :guest_purchases, :integer, null:false, default: 0
    remove_column :products, :user_liked, :boolean, null:false, default:true
    add_column :products, :user_liked, :boolean, null:false, default:false
    add_column :products, :ship_together_count, :integer, null:false, default:1
    add_column :users, :address_two, :string
    add_column :users, :approved_seller, :boolean, null:false, default:false
    add_column :products, :approved, :boolean, null:false, default:false
    add_column :products, :updated, :boolean, null:false, default:false
    add_column :products, :sold_out, :boolean, null:false, default:false
    remove_column :orders, :user_id, :integer
    add_column :orders, :user_uuid, :string
  end
end
