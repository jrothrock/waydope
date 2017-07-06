class AddUrlToNewsPosts < ActiveRecord::Migration[5.0]
  def change
  	add_reference :news_posts, :user, index: true, foreign_key: true
  	add_column :news_posts, :url, :string, null: false, default: ""
  	add_index :news_posts, :url
  	add_index :news_posts, :category
  end
end
