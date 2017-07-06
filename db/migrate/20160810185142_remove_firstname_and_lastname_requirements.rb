class RemoveFirstnameAndLastnameRequirements < ActiveRecord::Migration[5.0]
  def change
  	change_table :users do |t|
  		t.remove :firstname, :lastname
  	end
    add_column  :users, :firstname, :string
    add_column  :users, :lastname, :string
  end
end
