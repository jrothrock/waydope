class AddEditedToCommentsAndReplies < ActiveRecord::Migration[5.0]
  def change
  	add_column :comments, :edited, :boolean, null:false, default:false
  	add_column :replies, :edited, :boolean, null:false, default:false
  end
end
