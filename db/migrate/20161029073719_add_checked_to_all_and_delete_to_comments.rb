class AddCheckedToAllAndDeleteToComments < ActiveRecord::Migration[5.0]
  def change
  	add_column :comments, :deleted, :boolean, null:false, default:false
  	add_column :replies, :deleted, :boolean, null:false, default:false

  	add_column :news_posts, :flag_checked, :boolean, null:false, default:false
  	add_column :songs, :flag_checked, :boolean, null:false, default:false
  	add_column :videos, :flag_checked, :boolean, null:false, default:false
  	add_column :comments, :flag_checked, :boolean, null:false, default:false
  	add_column :replies, :flag_checked, :boolean, null:false, default:false

  	add_index :news_posts, :flag_checked
  	add_index :songs, :flag_checked
  	add_index :videos, :flag_checked
  	add_index :comments, :flag_checked
  	add_index :replies, :flag_checked
  end
end
