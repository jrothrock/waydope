class CreateNews < ActiveRecord::Migration[5.0]
  def change
    create_table :news_posts do |t|
      t.string :title
      t.string :category
      t.string :description
      t.string :link
      t.string :submitted_by

      t.timestamps
    end
  end
end
