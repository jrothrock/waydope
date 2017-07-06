class AddPreviewAndEmailToMessages < ActiveRecord::Migration[5.0]
  def change
  	add_column :messages, :email, :string, null: false, default: ''
  	add_column :messages, :preview, :string, null: false, default: ''
  	add_column :messages, :read, :boolean, null: false, default: false
  end
end
