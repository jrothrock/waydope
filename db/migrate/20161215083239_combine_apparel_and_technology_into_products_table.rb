class CombineApparelAndTechnologyIntoProductsTable < ActiveRecord::Migration[5.0]
  def self.up
    create_table :products do |t|
      t.string   "title",                                                   default: "",           null: false
      t.string   "creator",                                                 default: "",           null: false
      t.string   "creator_link",                                            default: "",           null: false
      t.string   "submitted_by",                                            default: "",           null: false
      t.text     "purchasers",                                              default: [],           null: false, array: true
      t.string   "category",                                                default: "",           null: false
      t.integer  "user_id"
      t.string   "url",                                                     default: "",           null: false
      t.string   "post_type",                                               default: "",           null: false
      t.integer  "upvotes",                                                 default: 0,            null: false
      t.integer  "downvotes",                                               default: 0,            null: false
      t.integer  "average_vote",                                            default: 0,            null: false
      t.integer  "comment_count",                                           default: 0,            null: false
      t.integer  "votes_count",                                             default: 0,            null: false
      t.integer  "freshness",                                               default: 0,            null: false
      t.integer  "user_voted"
      t.boolean  "deleted",                                                 default: false,        null: false
      t.boolean  "hidden",                                                  default: false,        null: false
      t.boolean  "deindexed",                                               default: false,        null: false
      t.boolean  "flagged",                                                                        null: false
      t.text     "flagged_type",                                            default: [],           null: false, array: true
      t.text     "flag_users",                                              default: [],           null: false, array: true
      t.boolean  "user_flagged",                                            default: false,        null: false
      t.integer  "flag_count",                                              default: 0,            null: false
      t.boolean  "flag_checked",                                            default: false,        null: false
      t.string   "main_category",                                           default: "",           null: false
      t.string   "main_category_display",                                   default: "",           null: false
      t.text     "categories",                                              default: [],           null: false, array: true
      t.boolean  "user_liked",                                              default: true,         null: false
      t.integer  "likes_count",                                             default: 0,            null: false
      t.integer  "user_rated"
      t.integer  "average_rating",                                          default: 100,          null: false
      t.integer  "ratings_count",                                           default: 0,            null: false
      t.text     "users_rated",                                             default: [],           null: false, array: true
      t.text     "ratings_user",                                            default: [],           null: false, array: true
      t.text     "ratings",                                                 default: [],           null: false, array: true
      t.integer  "average_simplified_rating",                               default: 0,            null: false
      t.integer  "average_simplified_rating_count",                         default: 0,            null: false
      t.integer  "form",                                                    default: 0,            null: false
      t.string   "og_url_name",                                             default: "",           null: false
      t.boolean  "categorized",                                             default: false,        null: false
      t.boolean  "worked",                                                  default: false,        null: false
      t.text     "description"
      t.boolean  "in_deletion",                                             default: false,        null: false
      t.datetime "created_at",                                                                     null: false
      t.datetime "updated_at",                                                                     null: false
      t.jsonb    "properties",                                              default: "{}",         null: false
      t.string   "sub_category",                                            default: "",           null: false
      t.integer  "zip",                                                     default: 0,            null: false
      t.string   "city",                                                    default: "",           null: false
      t.string   "state",                                                   default: "",           null: false
      t.decimal  "shipping",                        precision: 8, scale: 2
      t.string   "shipping_type",                                           default: "0",          null: false
      t.decimal  "tax",                             precision: 8, scale: 2
      t.boolean  "returns",                                                 default: false,        null: false
      t.boolean  "has_site",                                                default: false,        null: false
      t.boolean  "has_variations",                                          default: false,        null: false
      t.integer  "turnaround_time",                                         default: 0,            null: false
      t.string   "condition",                                               default: "nwb",        null: false
      t.tsvector "tsv_body"
      t.jsonb    "votes",                                                   default: "{}",         null: false
      t.jsonb    "likes",                                                   default: "{}",         null: false
      t.string   "size",                                                    default: "",           null: false
      t.string   "color",                                                   default: "",           null: false
      t.integer  "height",                                                  default: 0,            null: false
      t.integer  "width",                                                   default: 0,            null: false
      t.integer  "depth",                                                   default: 0,            null: false
      t.integer  "quantity",                                                default: 0,            null: false
      t.text     "marked",                                                  default: "",           null: false
      t.text     "stripped",                                                default: "",           null: false
      t.integer  "price",                                                   default: 0,            null: false
      t.integer  "sale_price",                                              default: 0,            null: false
      t.integer  "discount_percentage",                                     default: 0,            null: false
      t.index "properties jsonb_path_ops", name: "products_properties_idx", using: :gin
      t.index ["created_at"], name: "index_product_on_created_at", using: :btree
      t.index ["creator"], name: "index_product_on_creator", using: :btree
      t.index ["flag_checked"], name: "index_product_on_flag_checked", using: :btree
      t.index ["hidden"], name: "index_product_on_hidden", using: :btree
      t.index ["og_url_name"], name: "index_product_on_og_url_name", using: :btree
      t.index ["sub_category"], name: "index_products_on_sub_category", using: :btree
      t.index ["tsv_body"], name: "index_products_on_tsv_body", using: :gin
      t.index ["url"], name: "index_product_on_url", using: :btree
      t.index ["user_id"], name: "index_product_on_user_id", using: :btree
    end
    drop_table :apparels
    drop_table :technologies
  end
  def self.down
    drop_table :products
    create_table :apparels do |t|
      t.string   "title",                                                   default: "",        null: false
      t.string   "creator",                                                 default: "",        null: false
      t.string   "creator_link",                                            default: "",        null: false
      t.string   "submitted_by",                                            default: "",        null: false
      t.text     "purchasers",                                              default: [],        null: false, array: true
      t.string   "category",                                                default: "",        null: false
      t.integer  "user_id"
      t.string   "url",                                                     default: "",        null: false
      t.string   "post_type",                                               default: "apparel", null: false
      t.integer  "upvotes",                                                 default: 0,         null: false
      t.integer  "downvotes",                                               default: 0,         null: false
      t.integer  "average_vote",                                            default: 0,         null: false
      t.integer  "comment_count",                                           default: 0,         null: false
      t.integer  "votes_count",                                             default: 0,         null: false
      t.integer  "freshness",                                               default: 0,         null: false
      t.integer  "user_voted"
      t.boolean  "deleted",                                                 default: false,     null: false
      t.boolean  "hidden",                                                  default: false,     null: false
      t.boolean  "deindexed",                                               default: false,     null: false
      t.boolean  "flagged",                                                                     null: false
      t.text     "flagged_type",                                            default: [],        null: false, array: true
      t.text     "flag_users",                                              default: [],        null: false, array: true
      t.boolean  "user_flagged",                                            default: false,     null: false
      t.integer  "flag_count",                                              default: 0,         null: false
      t.boolean  "flag_checked",                                            default: false,     null: false
      t.string   "main_category",                                           default: "",        null: false
      t.string   "main_category_display",                                   default: "",        null: false
      t.text     "categories",                                              default: [],        null: false, array: true
      t.boolean  "user_liked",                                              default: true,      null: false
      t.integer  "likes_count",                                             default: 0,         null: false
      t.integer  "user_rated"
      t.integer  "average_rating",                                          default: 100,       null: false
      t.integer  "ratings_count",                                           default: 0,         null: false
      t.text     "users_rated",                                             default: [],        null: false, array: true
      t.text     "ratings_user",                                            default: [],        null: false, array: true
      t.text     "ratings",                                                 default: [],        null: false, array: true
      t.integer  "average_simplified_rating",                               default: 0,         null: false
      t.integer  "average_simplified_rating_count",                         default: 0,         null: false
      t.integer  "form",                                                    default: 0,         null: false
      t.string   "og_url_name",                                             default: "",        null: false
      t.boolean  "categorized",                                             default: false,     null: false
      t.boolean  "worked",                                                  default: false,     null: false
      t.text     "description"
      t.boolean  "in_deletion",                                             default: false,     null: false
      t.datetime "created_at",                                                                  null: false
      t.datetime "updated_at",                                                                  null: false
      t.jsonb    "properties",                                              default: "{}",      null: false
      t.string   "sub_category",                                            default: "",        null: false
      t.integer  "zip",                                                     default: 0,         null: false
      t.string   "city",                                                    default: "",        null: false
      t.string   "state",                                                   default: "",        null: false
      t.decimal  "shipping",                        precision: 8, scale: 2
      t.string   "shipping_type",                                           default: "0",       null: false
      t.decimal  "tax",                             precision: 8, scale: 2
      t.boolean  "returns",                                                 default: false,     null: false
      t.boolean  "has_site",                                                default: false,     null: false
      t.boolean  "has_variations",                                          default: false,     null: false
      t.integer  "turnaround_time",                                         default: 0,         null: false
      t.string   "condition",                                               default: "nwb",     null: false
      t.tsvector "tsv_body"
      t.jsonb    "votes",                                                   default: "{}",      null: false
      t.jsonb    "likes",                                                   default: "{}",      null: false
      t.string   "size",                                                    default: "",        null: false
      t.string   "color",                                                   default: "",        null: false
      t.integer  "height",                                                  default: 0,         null: false
      t.integer  "width",                                                   default: 0,         null: false
      t.integer  "depth",                                                   default: 0,         null: false
      t.integer  "quantity",                                                default: 0,         null: false
      t.text     "marked",                                                  default: "",        null: false
      t.text     "stripped",                                                default: "",        null: false
      t.integer  "price",                                                   default: 0,         null: false
      t.integer  "sale_price",                                              default: 0,         null: false
      t.integer  "discount_percentage",                                     default: 0,         null: false
      t.index "properties jsonb_path_ops", name: "apparels_properties_idx", using: :gin
      t.index ["created_at"], name: "index_apparel_on_created_at", using: :btree
      t.index ["creator"], name: "index_apparel_on_creator", using: :btree
      t.index ["flag_checked"], name: "index_apparel_on_flag_checked", using: :btree
      t.index ["hidden"], name: "index_apparel_on_hidden", using: :btree
      t.index ["og_url_name"], name: "index_apparel_on_og_url_name", using: :btree
      t.index ["sub_category"], name: "index_apparels_on_sub_category", using: :btree
      t.index ["tsv_body"], name: "index_apparels_on_tsv_body", using: :gin
      t.index ["url"], name: "index_apparel_on_url", using: :btree
      t.index ["user_id"], name: "index_apparel_on_user_id", using: :btree
    end
    create_table :technologies do |t|
      t.string   "title",                                                   default: "",           null: false
      t.string   "creator",                                                 default: "",           null: false
      t.string   "creator_link",                                            default: "",           null: false
      t.string   "submitted_by",                                            default: "",           null: false
      t.text     "purchasers",                                              default: [],           null: false, array: true
      t.string   "category",                                                default: "",           null: false
      t.integer  "user_id"
      t.string   "url",                                                     default: "",           null: false
      t.string   "post_type",                                               default: "technology", null: false
      t.integer  "upvotes",                                                 default: 0,            null: false
      t.integer  "downvotes",                                               default: 0,            null: false
      t.integer  "average_vote",                                            default: 0,            null: false
      t.integer  "comment_count",                                           default: 0,            null: false
      t.integer  "votes_count",                                             default: 0,            null: false
      t.integer  "freshness",                                               default: 0,            null: false
      t.integer  "user_voted"
      t.boolean  "deleted",                                                 default: false,        null: false
      t.boolean  "hidden",                                                  default: false,        null: false
      t.boolean  "deindexed",                                               default: false,        null: false
      t.boolean  "flagged",                                                                        null: false
      t.text     "flagged_type",                                            default: [],           null: false, array: true
      t.text     "flag_users",                                              default: [],           null: false, array: true
      t.boolean  "user_flagged",                                            default: false,        null: false
      t.integer  "flag_count",                                              default: 0,            null: false
      t.boolean  "flag_checked",                                            default: false,        null: false
      t.string   "main_category",                                           default: "",           null: false
      t.string   "main_category_display",                                   default: "",           null: false
      t.text     "categories",                                              default: [],           null: false, array: true
      t.boolean  "user_liked",                                              default: true,         null: false
      t.integer  "likes_count",                                             default: 0,            null: false
      t.integer  "user_rated"
      t.integer  "average_rating",                                          default: 100,          null: false
      t.integer  "ratings_count",                                           default: 0,            null: false
      t.text     "users_rated",                                             default: [],           null: false, array: true
      t.text     "ratings_user",                                            default: [],           null: false, array: true
      t.text     "ratings",                                                 default: [],           null: false, array: true
      t.integer  "average_simplified_rating",                               default: 0,            null: false
      t.integer  "average_simplified_rating_count",                         default: 0,            null: false
      t.integer  "form",                                                    default: 0,            null: false
      t.string   "og_url_name",                                             default: "",           null: false
      t.boolean  "categorized",                                             default: false,        null: false
      t.boolean  "worked",                                                  default: false,        null: false
      t.text     "description"
      t.boolean  "in_deletion",                                             default: false,        null: false
      t.datetime "created_at",                                                                     null: false
      t.datetime "updated_at",                                                                     null: false
      t.jsonb    "properties",                                              default: "{}",         null: false
      t.string   "sub_category",                                            default: "",           null: false
      t.integer  "zip",                                                     default: 0,            null: false
      t.string   "city",                                                    default: "",           null: false
      t.string   "state",                                                   default: "",           null: false
      t.decimal  "shipping",                        precision: 8, scale: 2
      t.string   "shipping_type",                                           default: "0",          null: false
      t.decimal  "tax",                             precision: 8, scale: 2
      t.boolean  "returns",                                                 default: false,        null: false
      t.boolean  "has_site",                                                default: false,        null: false
      t.boolean  "has_variations",                                          default: false,        null: false
      t.integer  "turnaround_time",                                         default: 0,            null: false
      t.string   "condition",                                               default: "nwb",        null: false
      t.tsvector "tsv_body"
      t.jsonb    "votes",                                                   default: "{}",         null: false
      t.jsonb    "likes",                                                   default: "{}",         null: false
      t.string   "size",                                                    default: "",           null: false
      t.string   "color",                                                   default: "",           null: false
      t.integer  "height",                                                  default: 0,            null: false
      t.integer  "width",                                                   default: 0,            null: false
      t.integer  "depth",                                                   default: 0,            null: false
      t.integer  "quantity",                                                default: 0,            null: false
      t.text     "marked",                                                  default: "",           null: false
      t.text     "stripped",                                                default: "",           null: false
      t.integer  "price",                                                   default: 0,            null: false
      t.integer  "sale_price",                                              default: 0,            null: false
      t.integer  "discount_percentage",                                     default: 0,            null: false
      t.index "properties jsonb_path_ops", name: "products_properties_idx", using: :gin
      t.index ["created_at"], name: "index_product_on_created_at", using: :btree
      t.index ["creator"], name: "index_product_on_creator", using: :btree
      t.index ["flag_checked"], name: "index_product_on_flag_checked", using: :btree
      t.index ["hidden"], name: "index_product_on_hidden", using: :btree
      t.index ["og_url_name"], name: "index_product_on_og_url_name", using: :btree
      t.index ["sub_category"], name: "index_products_on_sub_category", using: :btree
      t.index ["tsv_body"], name: "index_products_on_tsv_body", using: :gin
      t.index ["url"], name: "index_product_on_url", using: :btree
      t.index ["user_id"], name: "index_product_on_user_id", using: :btree
    end
    remove_index :products, :name => "products_properties_idx"
    remove_index :products, :name => "index_product_on_created_at"
    remove_index :products, :name => "index_product_on_creator"
    remove_index :products, :name => "index_product_on_flag_checked"
    remove_index :products, :name => "index_product_on_hidden"
    remove_index :products, :name => "index_product_on_og_url_name"
    remove_index :products, :name => "index_products_on_sub_category"
    remove_index :products, :name => "index_products_on_tsv_body"
    remove_index :products, :name => "index_product_on_url"
    remove_index :products, :name => "index_product_on_user_id"
  end
end
