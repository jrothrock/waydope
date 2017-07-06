class AddVariousColumnsToSellerOrdersAndUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :orders, :shipping_confirmation, :text, array:true, null:false, default:[]
    add_column :orders, :new_shipping, :boolean, null:false, default:false
    add_column :orders, :new_shipping_notification, :boolean, null:false, default:false
    add_column :bot_queue, :reply_to, :integer
    add_column :bot_queue, :marked_comment, :string
    add_column :bot_queue, :post_id, :integer, null:false, default:nil
    add_column :bot_queue, :post_category, :string
    add_column :bot_queue, :post_subcategory, :string
    add_column :bot_queue, :value, :jsonb
    remove_column :bot_queue, :value_string, :string
    remove_column :bot_queue, :value_boolean, :boolean
    remove_column :bot_queue, :value_integer, :integer
    remove_column :bot_queue, :user_uuid
    add_column :bot_queue, :user_uuid, :string
  end
end
