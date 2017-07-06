class AddLoginUsernameToUsers < ActiveRecord::Migration[5.0]
  def change
  	add_column :users, :login_username, :string, null: false, default: ""
    add_index :users, :login_username, unique: true
  end
end
