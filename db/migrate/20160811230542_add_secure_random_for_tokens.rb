class AddSecureRandomForTokens < ActiveRecord::Migration[5.0]
  def change
  	add_column :users, :token_string, :string
    add_index :users, :token_string, unique: true
  end
end
