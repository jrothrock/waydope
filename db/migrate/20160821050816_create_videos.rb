class CreateVideos < ActiveRecord::Migration[5.0]
  def change
    create_table :videos do |t|
      t.string :title
      t.string :category
      t.text :description
      t.text :link
      t.text :submitted_by

      t.timestamps
    end
  end
end
