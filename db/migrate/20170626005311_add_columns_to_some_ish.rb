class AddColumnsToSomeIsh < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :ssn_uploaded, :boolean, default:false
    add_column :users, :ssn_required, :boolean, default:false
    remove_column :users, :zip, :integer, null:false, default:0
    add_column :users, :zip, :integer
  end
end
