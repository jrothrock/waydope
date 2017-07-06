class AddPhotosTables < ActiveRecord::Migration[5.0]
  def change
    create_table :photos do |t|
      t.string :photo
      t.references :photoable, polymorphic: true, index: true
    end
    remove_column :apparels, :photos, :json
    remove_column :technologies, :photos, :json
  end
end
