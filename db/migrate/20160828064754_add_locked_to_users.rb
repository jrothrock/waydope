class AddLockedToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :locked, :boolean, null:false, default:false
  end
end
