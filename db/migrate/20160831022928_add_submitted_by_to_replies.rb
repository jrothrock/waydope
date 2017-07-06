class AddSubmittedByToReplies < ActiveRecord::Migration[5.0]
  def change
    add_column :replies, :submitted_by, :string, null:false, default:''
  end
end
