class AddDeletedColumnsToCommentsAndReplies < ActiveRecord::Migration[5.0]
  def change
  	add_column :comments, :deleted_body, :string
  	add_column :comments, :deleted_submitted_by, :string
  	add_column :comments, :deleted_user_id, :string
  	add_column :comments, :hidden, :boolean, null:false, default:false

  	add_column :replies, :deleted_body, :string
  	add_column :replies, :deleted_submitted_by, :string
  	add_column :replies, :deleted_user_id, :string
	  add_column :replies, :hidden, :boolean, null:false, default:false

  	add_column :news_posts, :deleted_description, :string
  	add_column :news_posts, :deleted_submitted_by, :string
  	add_column :news_posts, :deleted_user_id, :string

  	add_column :songs, :deleted_description, :string
  	add_column :songs, :deleted_submitted_by, :string
  	add_column :songs, :deleted_user_id, :string

  	add_column :videos, :deleted_description, :string
  	add_column :videos, :deleted_submitted_by, :string
  	add_column :videos, :deleted_user_id, :string

  	add_index :comments, :hidden
  	add_index :replies, :hidden
  	add_index :news_posts, :hidden
  	add_index :songs, :hidden
  	add_index :videos, :hidden

    remove_column :songs, :is_deleted, :boolean

  end
end
