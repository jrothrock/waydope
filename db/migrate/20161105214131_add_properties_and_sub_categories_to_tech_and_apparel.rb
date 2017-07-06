class AddPropertiesAndSubCategoriesToTechAndApparel < ActiveRecord::Migration[5.0]
  def up
      add_column :apparels, :properties, :jsonb, null: false, default: '{}'
      execute "CREATE INDEX on apparels USING GIN (properties jsonb_path_ops)"

      add_column :technologies, :properties, :jsonb, null: false, default: '{}'
      execute "CREATE INDEX on technologies USING GIN (properties jsonb_path_ops)"
     

      add_column :apparels, :sub_category, :string, null:false, default:""
      add_index :apparels, :sub_category

      add_column :technologies, :sub_category, :string, null:false, default:""
      add_index :technologies, :sub_category
  end
  def down
    remove_column :apparels, :properties
    remove_column :technologies, :properties
    remove_column :apparels, :sub_category
    remove_column :technologies, :sub_category
    remove_index :apparels, :properties
    remove_index :technologies, :properties
  end
end
