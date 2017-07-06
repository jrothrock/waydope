class AddEditedAndOldCategoriesToPosts < ActiveRecord::Migration[5.0]
  def change
  add_column :news_posts, :old_category, :string
  add_column :songs, :old_genre, :string
  add_column :videos, :old_category, :string

  add_column :news_posts, :edited, :boolean, null:false, default:false
  add_column :songs, :edited, :boolean, null:false, default:false
  add_column :videos, :edited, :boolean, null:false, default:false

  remove_foreign_key :news_posts, :users
  remove_foreign_key :songs, :users
  remove_foreign_key :videos, :users

  end
end
