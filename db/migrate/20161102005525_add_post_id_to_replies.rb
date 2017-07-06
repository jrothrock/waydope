class AddPostIdToReplies < ActiveRecord::Migration[5.0]
  def change
    add_column :replies, :post_type, :string, null:false, default:''
    add_column :replies, :post_id, :integer, null:false, default:0
    add_index :replies, :post_id
    add_index :replies, :post_type
  end
end
