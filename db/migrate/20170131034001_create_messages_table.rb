class CreateMessagesTable < ActiveRecord::Migration[5.0]
  def up
    rename_table :messages, :contact_messages
    create_table :messages do |t|
      t.string :sender, null:false, default:''
      t.string :body, null:false, default:''
      t.string :receiver, null:false, default:''
      t.string :conversation_id, null:false, default:''
      t.index :sender
      t.index :receiver
      t.index :conversation_id
      t.boolean :read, null:false, default:false
      t.timestamps
    end
    remove_column :products, :price
    remove_column :products, :sale_price
    add_column :products, :price, :decimal, precision: 8, scale: 2
    add_column :products, :sale_price, :decimal, precision: 8, scale: 2
    add_column :products, :updated, :boolean, null:false, default:false
    add_column :news_posts, :archived, :boolean, null:false, default:false
    add_column :songs, :archived, :boolean, null:false, default:false
    add_column :videos, :archived, :boolean, null:false, default:false
    add_column :products, :archived, :boolean, null:false, default:false
    add_column :comments, :archived, :boolean, null:false, default:false
    add_column :news_posts, :karma_update, :integer, null:false, default:0
    add_column :songs, :karma_update, :integer, null:false, default:0
    add_column :videos, :karma_update, :integer, null:false, default:0
    add_column :products, :karma_update, :integer, null:false, default:0
    add_column :comments, :karma_update, :integer, null:false, default:0
    add_column :news_posts, :voted, :boolean, null:false,default:false
    add_column :songs, :voted, :boolean, null:false,default:false
    add_column :videos, :voted, :boolean, null:false,default:false
    add_column :products, :voted, :boolean, null:false,default:false
    add_column :comments, :voted, :boolean, null:false,default:false
    add_column :comments, :removed, :boolean, null:false, default:false
    add_column :users, :last_login, :datetime
    add_column :users, :logins, :integer, null:false, default:0
    add_column :news_posts, :locked, :boolean, null:false, default:false
    add_column :songs, :locked, :boolean, null:false, default:false
    add_column :videos, :locked, :boolean, null:false, default:false
    add_column :products, :locked, :boolean, null:false, default:false
    add_column :comments, :locked, :boolean, null:false, default:false
    add_column :comments, :stickied, :boolean, null:false, default:false
  end
  def down
    drop_table :messages
    rename_table :contact_messages, :messages
    remove_column :products, :price
    remove_column :products, :sale_price
    remove_column :products, :updated
    add_column :products, :price, :integer, null:false, default:0
    add_column :products, :sale_price, :integer, null:false, default:0
    remove_column :news_posts, :archived
    remove_column :songs, :archived
    remove_column :videos, :archived
    remove_column :products, :archived
    remove_column :comments, :archived
    remove_column :news_posts, :karma_update
    remove_column :songs, :karma_update
    remove_column :videos, :karma_update
    remove_column :products, :karma_update
    remove_column :comments, :karma_update
    remove_column :news_posts, :voted
    remove_column :songs, :voted
    remove_column :videos, :voted
    remove_column :products, :voted
    remove_column :comments, :voted
    remove_column :comments, :removed
    remove_column :users, :last_login
    remove_column :users, :logins
    remove_column :news_posts, :locked
    remove_column :songs, :locked
    remove_column :videos, :locked
    remove_column :products, :locked
    remove_column :comments, :locked
    remove_column :comments, :stickied
  end
end
