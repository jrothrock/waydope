class ChangeCommentStrucutre < ActiveRecord::Migration[5.0]

  def up
    drop_table :comments
    create_table :comments do |c|
      c.text :body
      c.integer :generation
      c.string :submitted_by
      c.integer  :user_id
      c.integer  :song_id
      c.timestamps
    end
    add_index :comments, :user_id
    add_index :comments, :song_id
   create_table :replies do |r|
      r.text :body
      r.integer :comment_id
      r.integer :reply_id
      r.integer :generation
      r.text :title
      r.submitted_by :string
      r.timestamps
    end
    add_index :replies, :comment_id
    add_index :replies, :reply_id
  end

  def down
    create_table :comments do |t|
      t.text :body
      t.string :submitted_by
      t.integer :parent_id
      t.integer :user_id
      t.integer :song_id
      t.text :children, null: false, array: true, default: []
      t.integer :generation
    end
    add_index comments: :user_id
    add_index comments: :song_id
  end

end
