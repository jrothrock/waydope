class AddAbilityToBanUsers < ActiveRecord::Migration[5.0]
  def change
  	add_column :users, :good_standing, :boolean, null: false, default: true
  	add_column :users, :old_password, :string
  end
end
