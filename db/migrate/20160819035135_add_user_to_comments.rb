class AddUserToComments < ActiveRecord::Migration[5.0]
  def change
   add_column :comments, :submitted_by, :string, null: false, default: ""
  end
end
