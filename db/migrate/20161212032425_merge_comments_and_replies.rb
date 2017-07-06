class MergeCommentsAndReplies < ActiveRecord::Migration[5.0]
  def self.up
    drop_table :replies

    # add_column :comments, :main_comment_id, :integer
    add_column :comments, :parent_id, :integer
    add_column :comments, :notified, :boolean, default:false, null:false
    add_column :comments, :category, :string
    add_column :comments, :subcategory, :string
    add_column :comments, :url, :string
    add_column :comments, :post_type, :string
    add_column :comments, :post_id, :string
    add_column :comments, :user_voted, :integer
  end
  
  def self.down
    # remove_column :comments, :main_comment_id
    remove_column :comments, :parent_id
    remove_column :comments, :notified
    remove_column :comments, :category
    remove_column :comments, :subcategory
    remove_column :comments, :url
    remove_column :comments, :post_type
    remove_column :comments, :post_id
    remove_column :comments, :user_voted, :integer

    create_table "replies" do |t|
      t.text     "body"
      t.integer  "comment_id"
      t.integer  "reply_id"
      t.integer  "generation"
      t.text     "title"
      t.datetime "created_at",                           null: false
      t.datetime "updated_at",                           null: false
      t.string   "submitted_by",         default: "",    null: false
      t.integer  "upvotes",              default: 0,     null: false
      t.integer  "downvotes",            default: 0,     null: false
      t.integer  "average_vote",         default: 0,     null: false
      t.boolean  "edited",               default: false, null: false
      t.integer  "user_id"
      t.boolean  "flagged",              default: false, null: false
      t.text     "flagged_type",         default: [],    null: false, array: true
      t.text     "flag_users",           default: [],    null: false, array: true
      t.boolean  "user_flagged",         default: false, null: false
      t.integer  "flag_count",           default: 0,     null: false
      t.boolean  "deleted",              default: false, null: false
      t.boolean  "flag_checked",         default: false, null: false
      t.string   "deleted_body"
      t.string   "deleted_submitted_by"
      t.string   "deleted_user_id"
      t.boolean  "hidden",               default: false, null: false
      t.boolean  "hide_proccessing",     default: false, null: false
      t.string   "post_type",            default: "",    null: false
      t.integer  "post_id",              default: 0,     null: false
      t.jsonb    "votes",                default: "{}",  null: false
      t.integer  "votes_count",          default: 0,     null: false
      t.text     "marked",               default: "",    null: false
      t.text     "stripped",             default: "",    null: false
      t.boolean  "notified",             default: false, null: false
      t.string   "category",             default: "",    null: false
      t.string   "subcategory",          default: ""
      t.string   "url",                  default: "",    null: false
      t.index ["comment_id"], name: "index_replies_on_comment_id", using: :btree
      t.index ["flag_checked"], name: "index_replies_on_flag_checked", using: :btree
      t.index ["flagged"], name: "index_replies_on_flagged", using: :btree
      t.index ["hidden"], name: "index_replies_on_hidden", using: :btree
      t.index ["post_id"], name: "index_replies_on_post_id", using: :btree
      t.index ["post_type"], name: "index_replies_on_post_type", using: :btree
      t.index ["reply_id"], name: "index_replies_on_reply_id", using: :btree
    end
  end
end
