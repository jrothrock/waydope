class AddUuidToUsers < ActiveRecord::Migration[5.0]
  def change
  	add_column :users, :uuid, :string, null:false, default: true
  	add_index :users, :uuid, unique: true
  end
end
