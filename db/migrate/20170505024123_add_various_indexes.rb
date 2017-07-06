class AddVariousIndexes < ActiveRecord::Migration[5.0]
  def change
    add_index :orders, :uuid, unique:true
    add_index :sellers, :user_id, unique:true
    add_index :songs, [:main_genre, :url], unique:true
    add_index :news_posts, [:main_category, :url], unique:true
    add_index :videos, [:main_category, :url], unique:true
    add_index :products, [:post_type, :main_category, :sub_category, :url], unique:true, name:"index_for_product_posts___type_category_subcategory_url"
    add_index :comments, :parent_id
    add_index :comments, :submitted_by
  end
end
