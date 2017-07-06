class CreateSongs < ActiveRecord::Migration[5.0]
  def change
    create_table :songs do |t|
      t.string :title, null: false, default: ""
      t.string :artist, null: false, default: ""
      t.string :genre, null: false, default: ""
      t.text :description
      t.text :link, null: false, default: ""
      t.text :submitted_by, null: false, default: ""

      t.timestamps
    end
  end
end
