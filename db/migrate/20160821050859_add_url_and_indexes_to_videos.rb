class AddUrlAndIndexesToVideos < ActiveRecord::Migration[5.0]
  def change
  	add_reference :videos, :user, index: true, foreign_key: true
  	add_column :videos, :url, :string, null: false, default: ""
  	add_index :videos, :url
  	add_index :videos, :category
  end
end
