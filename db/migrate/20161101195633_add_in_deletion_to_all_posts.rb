class AddInDeletionToAllPosts < ActiveRecord::Migration[5.0]
  def change
  add_column :news_posts, :in_deletion, :boolean, null:false, default:false
  add_column :songs, :in_deletion, :boolean, null:false, default:false
  add_column :videos, :in_deletion, :boolean, null:false, default:false

  add_column :news_posts, :unindexed, :boolean, null:false, default:false
  add_column :songs, :unindexed, :boolean, null:false, default:false
  add_column :videos, :unindexed, :boolean, null:false, default:false

  add_column :comments, :hide_proccessing, :boolean, null:false, default:false
  add_column :replies, :hide_proccessing, :boolean, null:false, default:false
  end
end
