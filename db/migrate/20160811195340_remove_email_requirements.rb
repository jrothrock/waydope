class RemoveEmailRequirements < ActiveRecord::Migration[5.0]
  def change
  	remove_column :users, :email
  	add_column  :users, :email, :string
  end
end
