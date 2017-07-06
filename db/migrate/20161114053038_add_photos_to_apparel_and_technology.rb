class AddPhotosToApparelAndTechnology < ActiveRecord::Migration[5.0]
  def change
    add_column :apparels, :photos, :jsonb
    add_column :technologies, :photos, :jsonb
  end
end
