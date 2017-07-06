class AddLoggedInToUser < ActiveRecord::Migration[5.0]
  def change
  	add_column :users, :logged_in, :boolean, null:false, default: false
  end
end
