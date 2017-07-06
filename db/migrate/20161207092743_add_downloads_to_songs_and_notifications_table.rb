class AddDownloadsToSongsAndNotificationsTable < ActiveRecord::Migration[5.0]
  def change
    add_column :songs, :download, :integer, null:false, default: 0
    add_column :songs, :download_text, :string, null:false, default: ''
    add_column :songs, :download_url, :string, null:false, default: ''

    add_column :replies, :notified, :boolean, null:false, default: false
    add_column :replies, :category, :string, null:false, default:''
    add_column :replies, :subcategory, :string, default:''
    add_column :replies, :url, :string, null:false, default:''

    add_column :users, :comments, :text, array:true, default:[]

    create_table :notifications do |t|
      t.string :user_username, index: true
      t.string :notified_by, index: true
      t.string :notified_by_id, index: true
      t.references :notifiable, polymorphic: true, index: true
      t.integer :identifier
      t.string :notice_type
      t.boolean :read, default: false
      t.string :post_type
      t.string :category
      t.string :subcategory
      t.string :url
      t.string :body
    end
  end
end
