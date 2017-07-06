# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170626005311) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "board_categories", force: :cascade do |t|
    t.integer  "count",       default: 0,     null: false
    t.integer  "multiplier",  default: 0,     null: false
    t.text     "top_day",     default: [],    null: false, array: true
    t.text     "top_week",    default: [],    null: false, array: true
    t.text     "top_month",   default: [],    null: false, array: true
    t.text     "top_year",    default: [],    null: false, array: true
    t.text     "top_alltime", default: [],    null: false, array: true
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.string   "title"
    t.string   "url"
    t.boolean  "new_posts",   default: false, null: false
    t.index ["count"], name: "index_board_categories_on_count", using: :btree
    t.index ["created_at"], name: "index_board_categories_on_created_at", using: :btree
    t.index ["url"], name: "index_board_categories_on_url", using: :btree
  end

  create_table "bot_queue", force: :cascade do |t|
    t.integer  "queue_type",       default: 1,     null: false
    t.string   "post_type",        default: "",    null: false
    t.datetime "run_at"
    t.string   "marked_comment"
    t.string   "post_category"
    t.string   "post_subcategory"
    t.jsonb    "value"
    t.string   "user_uuid"
    t.integer  "group_id"
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
    t.boolean  "in_queue",         default: false, null: false
    t.string   "post_id"
    t.string   "reply_to",         default: ""
    t.string   "reply_id"
  end

  create_table "cart_abandonment", force: :cascade do |t|
    t.integer  "stage",          default: 0,     null: false
    t.boolean  "abandoned",      default: false, null: false
    t.integer  "duration",       default: 0,     null: false
    t.string   "cart_id"
    t.string   "user_id"
    t.string   "ip_address"
    t.jsonb    "stage_duration", default: {},    null: false
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
  end

  create_table "comments", force: :cascade do |t|
    t.text     "body"
    t.integer  "generation"
    t.string   "submitted_by"
    t.datetime "created_at",                           null: false
    t.datetime "updated_at",                           null: false
    t.string   "commentable_type"
    t.integer  "upvotes",              default: 0,     null: false
    t.integer  "downvotes",            default: 0,     null: false
    t.integer  "average_vote",         default: 0,     null: false
    t.boolean  "edited",               default: false, null: false
    t.integer  "user_id"
    t.boolean  "flagged",              default: false, null: false
    t.boolean  "deleted",              default: false, null: false
    t.boolean  "flag_checked",         default: false, null: false
    t.string   "deleted_body"
    t.string   "deleted_submitted_by"
    t.string   "deleted_user_id"
    t.boolean  "hidden",               default: false, null: false
    t.boolean  "hide_proccessing",     default: false, null: false
    t.jsonb    "votes",                default: {},    null: false
    t.integer  "votes_count",          default: 0,     null: false
    t.text     "marked",               default: "",    null: false
    t.text     "stripped",             default: "",    null: false
    t.boolean  "notified",             default: false, null: false
    t.string   "category"
    t.string   "subcategory"
    t.string   "url"
    t.string   "post_type"
    t.string   "post_id"
    t.integer  "user_voted"
    t.string   "title"
    t.boolean  "admin",                default: false, null: false
    t.boolean  "seller",               default: false, null: false
    t.boolean  "submitter",            default: false, null: false
    t.string   "time_ago"
    t.boolean  "styled",               default: false, null: false
    t.boolean  "archived",             default: false, null: false
    t.integer  "karma_update",         default: 0,     null: false
    t.boolean  "voted",                default: false, null: false
    t.boolean  "removed",              default: false, null: false
    t.boolean  "locked",               default: false, null: false
    t.boolean  "stickied",             default: false, null: false
    t.jsonb    "votes_ip",             default: {},    null: false
    t.boolean  "checked",              default: false, null: false
    t.boolean  "reported",             default: false, null: false
    t.text     "report_users",         default: [],    null: false, array: true
    t.boolean  "user_reported",        default: false, null: false
    t.text     "report_types",         default: [],    null: false, array: true
    t.integer  "report_count",         default: 0,     null: false
    t.boolean  "report_checked",       default: false, null: false
    t.datetime "report_created"
    t.datetime "flag_created"
    t.jsonb    "human_votes",          default: {},    null: false
    t.integer  "human_votes_count",    default: 0,     null: false
    t.integer  "human_average_vote",   default: 0,     null: false
    t.integer  "human_upvotes",        default: 0,     null: false
    t.integer  "human_downvotes",      default: 0,     null: false
    t.string   "uuid",                 default: "",    null: false
    t.string   "commentable_uuid",     default: "",    null: false
    t.string   "parent_uuid",          default: ""
    t.index ["commentable_type", "commentable_uuid"], name: "index_comments_on_commentable_type_and_commentable_uuid", using: :btree
    t.index ["flag_checked"], name: "index_comments_on_flag_checked", using: :btree
    t.index ["flagged"], name: "index_comments_on_flagged", using: :btree
    t.index ["hidden"], name: "index_comments_on_hidden", using: :btree
    t.index ["submitted_by"], name: "index_comments_on_submitted_by", using: :btree
  end

  create_table "contact_messages", force: :cascade do |t|
    t.string   "title",        default: "",    null: false
    t.string   "category",     default: "",    null: false
    t.text     "body",         default: "",    null: false
    t.string   "submitted_by", default: "",    null: false
    t.datetime "created_at",                   null: false
    t.datetime "updated_at",                   null: false
    t.string   "email",        default: "",    null: false
    t.string   "preview",      default: "",    null: false
    t.boolean  "read",         default: false, null: false
  end

  create_table "impressions", force: :cascade do |t|
    t.jsonb    "countries"
    t.integer  "new_sessions"
    t.datetime "date"
    t.integer  "visitors"
    t.integer  "uniques"
    t.jsonb    "countries_unique"
    t.jsonb    "countries_pageviews"
    t.integer  "pageviews"
    t.integer  "mobile"
    t.integer  "non_mobile"
    t.jsonb    "countries_mobile"
    t.jsonb    "countries_non_mobile"
    t.integer  "bounced"
    t.float    "average_pageviews"
    t.float    "average_pageviews_mobile"
    t.float    "average_pageviews_non_mobile"
    t.jsonb    "countries_bounced"
    t.jsonb    "durations"
    t.jsonb    "durations_mobile"
    t.integer  "average_duration_mobile"
    t.jsonb    "durations_non_mobile"
    t.integer  "average_duration_non_mobile"
    t.jsonb    "referers"
    t.jsonb    "user_agents"
    t.jsonb    "trackers"
    t.integer  "duration"
    t.jsonb    "cities_unique",                default: {}, null: false
    t.jsonb    "states_unique",                default: {}, null: false
    t.integer  "bounced_mobile",               default: 0
    t.integer  "bounced_non_mobile",           default: 0
    t.jsonb    "average_durations_countries",  default: {}
    t.jsonb    "average_pageviews_countries",  default: {}
    t.jsonb    "pageviews_mobile",             default: {}
    t.jsonb    "pageviews_nonmobile",          default: {}
    t.integer  "average_duration",             default: 0
    t.jsonb    "ips",                          default: {}
  end

  create_table "messages", force: :cascade do |t|
    t.string   "sender",          default: "",    null: false
    t.string   "body",            default: "",    null: false
    t.string   "receiver",        default: "",    null: false
    t.string   "conversation_id", default: "",    null: false
    t.boolean  "read",            default: false, null: false
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
    t.string   "time_ago"
    t.index ["conversation_id"], name: "index_messages_on_conversation_id", using: :btree
    t.index ["receiver"], name: "index_messages_on_receiver", using: :btree
    t.index ["sender"], name: "index_messages_on_sender", using: :btree
  end

  create_table "music_genres", force: :cascade do |t|
    t.integer  "count",       default: 0,     null: false
    t.integer  "multiplier",  default: 0,     null: false
    t.text     "top_day",     default: [],    null: false, array: true
    t.text     "top_week",    default: [],    null: false, array: true
    t.text     "top_month",   default: [],    null: false, array: true
    t.text     "top_year",    default: [],    null: false, array: true
    t.text     "top_alltime", default: [],    null: false, array: true
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.string   "title"
    t.string   "url"
    t.boolean  "new_posts",   default: false, null: false
    t.index ["count"], name: "index_music_genres_on_count", using: :btree
    t.index ["created_at"], name: "index_music_genres_on_created_at", using: :btree
    t.index ["url"], name: "index_music_genres_on_url", using: :btree
  end

  create_table "news_posts", force: :cascade do |t|
    t.string   "title"
    t.string   "description"
    t.string   "link"
    t.string   "submitted_by"
    t.datetime "created_at",                                             null: false
    t.datetime "updated_at",                                             null: false
    t.integer  "user_id"
    t.string   "url",                                   default: "",     null: false
    t.string   "post_type",                             default: "news", null: false
    t.integer  "upvotes",                               default: 0,      null: false
    t.integer  "downvotes",                             default: 0,      null: false
    t.integer  "average_vote",                          default: 0,      null: false
    t.integer  "comment_count",                         default: 0,      null: false
    t.integer  "votes_count",                           default: 0,      null: false
    t.integer  "user_voted"
    t.boolean  "deleted",                               default: false,  null: false
    t.boolean  "hidden",                                default: false,  null: false
    t.string   "main_category",                         default: "",     null: false
    t.string   "main_category_display",                 default: "",     null: false
    t.text     "categories",                            default: [],     null: false, array: true
    t.boolean  "user_liked",                            default: false,  null: false
    t.integer  "likes_count",                           default: 0,      null: false
    t.integer  "user_rated"
    t.integer  "average_rating",                        default: 100,    null: false
    t.integer  "ratings_count",                         default: 0,      null: false
    t.text     "users_rated",                           default: [],     null: false, array: true
    t.integer  "average_simplified_rating",             default: 0,      null: false
    t.integer  "average_simplified_rating_count",       default: 0,      null: false
    t.boolean  "categorized",                           default: false,  null: false
    t.integer  "form",                                  default: 0,      null: false
    t.boolean  "flagged",                               default: false,  null: false
    t.string   "og_url_name",                           default: "",     null: false
    t.boolean  "flag_checked",                          default: false,  null: false
    t.string   "deleted_description"
    t.string   "deleted_submitted_by"
    t.string   "deleted_user_id"
    t.string   "old_category"
    t.boolean  "edited",                                default: false,  null: false
    t.boolean  "in_deletion",                           default: false,  null: false
    t.boolean  "unindexed",                             default: false,  null: false
    t.tsvector "tsv_body"
    t.jsonb    "ratings",                               default: {},     null: false
    t.jsonb    "votes",                                 default: {},     null: false
    t.text     "marked",                                default: "",     null: false
    t.text     "stripped",                              default: "",     null: false
    t.string   "time_ago"
    t.boolean  "archived",                              default: false,  null: false
    t.integer  "karma_update",                          default: 0,      null: false
    t.boolean  "voted",                                 default: false,  null: false
    t.boolean  "locked",                                default: false,  null: false
    t.jsonb    "votes_ip",                              default: {},     null: false
    t.jsonb    "ratings_ip",                            default: {},     null: false
    t.jsonb    "likes_ip",                              default: {},     null: false
    t.string   "hostname"
    t.boolean  "secure_link"
    t.string   "teaser"
    t.jsonb    "extras"
    t.integer  "title_change",                          default: 0,      null: false
    t.boolean  "worked",                                default: false,  null: false
    t.boolean  "nsfw",                                  default: false,  null: false
    t.boolean  "featured",                              default: false,  null: false
    t.boolean  "nsfw_flag",                             default: false,  null: false
    t.boolean  "checked",                               default: false,  null: false
    t.boolean  "reported",                              default: false,  null: false
    t.text     "report_users",                          default: [],     null: false, array: true
    t.boolean  "user_reported",                         default: false,  null: false
    t.text     "report_types",                          default: [],     null: false, array: true
    t.integer  "report_count",                          default: 0,      null: false
    t.boolean  "report_checked",                        default: false,  null: false
    t.datetime "report_created"
    t.datetime "flag_created"
    t.integer  "total_views",                           default: 0,      null: false
    t.jsonb    "views",                                 default: {},     null: false
    t.integer  "user_views",                            default: 0,      null: false
    t.integer  "guest_views",                           default: 0,      null: false
    t.jsonb    "views_ip",                              default: {},     null: false
    t.jsonb    "human_votes",                           default: {},     null: false
    t.integer  "human_votes_count",                     default: 0,      null: false
    t.integer  "human_average_vote",                    default: 0,      null: false
    t.integer  "human_upvotes",                         default: 0,      null: false
    t.integer  "human_downvotes",                       default: 0,      null: false
    t.jsonb    "human_ratings",                         default: {},     null: false
    t.integer  "human_average_rating",                  default: 0,      null: false
    t.integer  "human_ratings_count",                   default: 0,      null: false
    t.jsonb    "durations",                             default: {},     null: false
    t.jsonb    "durations_ip",                          default: {},     null: false
    t.integer  "average_duration",                      default: 0,      null: false
    t.boolean  "user_viewed",                           default: false,  null: false
    t.integer  "unique_views",                          default: 0,      null: false
    t.float    "hotness",                               default: 0.0,    null: false
    t.float    "freshness",                             default: 0.0,    null: false
    t.boolean  "removed"
    t.jsonb    "likes",                                 default: {}
    t.jsonb    "properties",                            default: {}
    t.integer  "human_average_simplified_rating",       default: 0,      null: false
    t.integer  "human_average_simplified_rating_count", default: 0,      null: false
    t.string   "uuid",                                  default: "",     null: false
    t.index ["created_at"], name: "index_news_posts_on_created_at", using: :btree
    t.index ["flag_checked"], name: "index_news_posts_on_flag_checked", using: :btree
    t.index ["flagged"], name: "index_news_posts_on_flagged", using: :btree
    t.index ["hidden"], name: "index_news_posts_on_hidden", using: :btree
    t.index ["main_category", "url"], name: "index_news_posts_on_main_category_and_url", unique: true, using: :btree
    t.index ["og_url_name"], name: "index_news_posts_on_og_url_name", using: :btree
    t.index ["tsv_body"], name: "index_news_posts_on_tsv_body", using: :gin
    t.index ["url"], name: "index_news_posts_on_url", using: :btree
    t.index ["user_id"], name: "index_news_posts_on_user_id", using: :btree
  end

  create_table "notifications", force: :cascade do |t|
    t.string   "user_username"
    t.string   "notified_by"
    t.string   "notified_by_id"
    t.string   "notifiable_type"
    t.integer  "notifiable_id"
    t.integer  "identifier"
    t.string   "notice_type"
    t.boolean  "read",            default: false
    t.string   "post_type"
    t.string   "category"
    t.string   "subcategory"
    t.string   "url"
    t.string   "body"
    t.string   "title"
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
    t.string   "time_ago"
    t.integer  "quantity",        default: 0,     null: false
    t.index ["notifiable_type", "notifiable_id"], name: "index_notifications_on_notifiable_type_and_notifiable_id", using: :btree
    t.index ["notified_by"], name: "index_notifications_on_notified_by", using: :btree
    t.index ["notified_by_id"], name: "index_notifications_on_notified_by_id", using: :btree
    t.index ["user_username"], name: "index_notifications_on_user_username", using: :btree
  end

  create_table "orders", force: :cascade do |t|
    t.integer  "status",                                            default: 1,     null: false
    t.jsonb    "quantities",                                        default: {},    null: false
    t.text     "products",                                          default: [],    null: false, array: true
    t.string   "uuid",                                              default: "",    null: false
    t.string   "user_uuid"
    t.boolean  "sellers_notified",                                  default: false, null: false
    t.string   "firstname",                                         default: "",    null: false
    t.string   "lastname",                                          default: "",    null: false
    t.string   "address",                                           default: "",    null: false
    t.string   "zip",                                               default: "",    null: false
    t.string   "address_two"
    t.string   "city",                                              default: "",    null: false
    t.string   "state",                                             default: "",    null: false
    t.datetime "created_at",                                                        null: false
    t.datetime "updated_at",                                                        null: false
    t.boolean  "new_shipping",                                      default: false, null: false
    t.boolean  "new_shipping_notification",                         default: false, null: false
    t.decimal  "total",                     precision: 8, scale: 2, default: "0.0", null: false
    t.decimal  "sub_total",                 precision: 8, scale: 2, default: "0.0", null: false
    t.decimal  "shipping",                  precision: 8, scale: 2, default: "0.0", null: false
    t.decimal  "tax",                       precision: 8, scale: 2, default: "0.0", null: false
    t.decimal  "tax_rate",                  precision: 8, scale: 4, default: "0.0", null: false
    t.jsonb    "taxes",                                             default: {},    null: false
    t.string   "email"
    t.jsonb    "shipping_confirmations",                            default: {},    null: false
    t.jsonb    "shipped",                                           default: {},    null: false
    t.jsonb    "totals",                                            default: {},    null: false
    t.jsonb    "shippings",                                         default: {},    null: false
    t.jsonb    "sub_totals",                                        default: {},    null: false
    t.boolean  "zip_checked",                                       default: false, null: false
    t.jsonb    "properties",                                        default: {}
    t.datetime "purchased_at"
    t.datetime "tracker_sent"
    t.datetime "tracker_updated"
    t.string   "paid_with",                                         default: ""
    t.string   "stripe_payment_id",                                 default: ""
    t.string   "paypal_payment_id",                                 default: ""
    t.string   "paypal_payouts_id",                                 default: ""
    t.jsonb    "stripe_payout_ids",                                 default: {}
    t.index ["uuid"], name: "index_orders_on_uuid", unique: true, using: :btree
  end

  create_table "partners", force: :cascade do |t|
    t.string  "name",         default: "",    null: false
    t.string  "email",        default: "",    null: false
    t.string  "contact_name", default: "",    null: false
    t.string  "phone",        default: "",    null: false
    t.string  "website",      default: "",    null: false
    t.string  "information",  default: "",    null: false
    t.boolean "read",         default: false, null: false
    t.boolean "accepted",     default: false, null: false
    t.string  "submitted_by"
  end

  create_table "pg_search_documents", force: :cascade do |t|
    t.text     "content"
    t.string   "searchable_type"
    t.integer  "searchable_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.index ["searchable_type", "searchable_id"], name: "index_pg_search_documents_on_searchable_type_and_searchable_id", using: :btree
  end

  create_table "photos", force: :cascade do |t|
    t.string   "photo"
    t.string   "photoable_type"
    t.string   "user_uuid",      default: "", null: false
    t.string   "uuid"
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.integer  "photoable_id"
    t.index ["photoable_type", "photoable_id"], name: "index_photos_on_photoable_type_and_photoable_id", using: :btree
  end

  create_table "products", force: :cascade do |t|
    t.string   "title",                                                         default: "",    null: false
    t.string   "creator",                                                       default: "",    null: false
    t.string   "creator_link",                                                  default: "",    null: false
    t.string   "submitted_by",                                                  default: "",    null: false
    t.string   "category",                                                      default: "",    null: false
    t.string   "url",                                                           default: "",    null: false
    t.string   "post_type",                                                     default: "",    null: false
    t.integer  "upvotes",                                                       default: 0,     null: false
    t.integer  "downvotes",                                                     default: 0,     null: false
    t.integer  "average_vote",                                                  default: 0,     null: false
    t.integer  "comment_count",                                                 default: 0,     null: false
    t.integer  "votes_count",                                                   default: 0,     null: false
    t.integer  "user_voted"
    t.boolean  "deleted",                                                       default: false, null: false
    t.boolean  "hidden",                                                        default: false, null: false
    t.boolean  "deindexed",                                                     default: false, null: false
    t.boolean  "flagged",                                                                       null: false
    t.boolean  "flag_checked",                                                  default: false, null: false
    t.string   "main_category",                                                 default: "",    null: false
    t.string   "main_category_display",                                         default: "",    null: false
    t.text     "categories",                                                    default: [],    null: false, array: true
    t.integer  "likes_count",                                                   default: 0,     null: false
    t.integer  "user_rated"
    t.integer  "average_rating",                                                default: 100,   null: false
    t.integer  "ratings_count",                                                 default: 0,     null: false
    t.text     "users_rated",                                                   default: [],    null: false, array: true
    t.text     "ratings_user",                                                  default: [],    null: false, array: true
    t.integer  "average_simplified_rating",                                     default: 0,     null: false
    t.integer  "average_simplified_rating_count",                               default: 0,     null: false
    t.integer  "form",                                                          default: 0,     null: false
    t.string   "og_url_name",                                                   default: "",    null: false
    t.boolean  "categorized",                                                   default: false, null: false
    t.boolean  "worked",                                                        default: false, null: false
    t.text     "description"
    t.boolean  "in_deletion",                                                   default: false, null: false
    t.datetime "created_at",                                                                    null: false
    t.datetime "updated_at",                                                                    null: false
    t.jsonb    "properties",                                                    default: {},    null: false
    t.string   "sub_category",                                                  default: "",    null: false
    t.integer  "zip",                                                           default: 0,     null: false
    t.string   "city",                                                          default: "",    null: false
    t.string   "state",                                                         default: "",    null: false
    t.decimal  "shipping",                              precision: 8, scale: 2
    t.string   "shipping_type",                                                 default: "0",   null: false
    t.decimal  "tax",                                   precision: 8, scale: 2
    t.boolean  "returns",                                                       default: false, null: false
    t.boolean  "has_site",                                                      default: false, null: false
    t.boolean  "has_variations",                                                default: false, null: false
    t.integer  "turnaround_time",                                               default: 0,     null: false
    t.string   "condition",                                                     default: "nwb", null: false
    t.tsvector "tsv_body"
    t.jsonb    "votes",                                                         default: {},    null: false
    t.jsonb    "likes",                                                         default: {},    null: false
    t.string   "size",                                                          default: "",    null: false
    t.string   "color",                                                         default: "",    null: false
    t.integer  "height",                                                        default: 0,     null: false
    t.integer  "width",                                                         default: 0,     null: false
    t.integer  "depth",                                                         default: 0,     null: false
    t.integer  "quantity",                                                      default: 0,     null: false
    t.text     "marked",                                                        default: "",    null: false
    t.text     "stripped",                                                      default: "",    null: false
    t.integer  "discount_percentage",                                           default: 0,     null: false
    t.jsonb    "ratings",                                                       default: {},    null: false
    t.jsonb    "fit",                                                           default: {},    null: false
    t.integer  "fit_count",                                                     default: 0,     null: false
    t.integer  "lock_version",                                                  default: 0,     null: false
    t.boolean  "featured",                                                      default: false, null: false
    t.integer  "user_id"
    t.jsonb    "purchasers",                                                    default: {},    null: false
    t.integer  "guest_purchases",                                               default: 0,     null: false
    t.boolean  "user_liked",                                                    default: false, null: false
    t.integer  "ship_together_count",                                           default: 1,     null: false
    t.boolean  "approved",                                                      default: false, null: false
    t.boolean  "sold_out",                                                      default: false, null: false
    t.integer  "seller_id"
    t.string   "time_ago"
    t.decimal  "price",                                 precision: 8, scale: 2
    t.decimal  "sale_price",                            precision: 8, scale: 2
    t.boolean  "updated",                                                       default: false, null: false
    t.boolean  "archived",                                                      default: false, null: false
    t.integer  "karma_update",                                                  default: 0,     null: false
    t.boolean  "voted",                                                         default: false, null: false
    t.boolean  "locked",                                                        default: false, null: false
    t.jsonb    "votes_ip",                                                      default: {},    null: false
    t.jsonb    "ratings_ip",                                                    default: {},    null: false
    t.jsonb    "likes_ip",                                                      default: {},    null: false
    t.jsonb    "extras"
    t.boolean  "uploaded",                                                      default: false, null: false
    t.text     "upload_urls",                                                   default: [],    null: false, array: true
    t.boolean  "sorted",                                                        default: false, null: false
    t.text     "sorting",                                                       default: [],    null: false, array: true
    t.integer  "title_change",                                                  default: 0,     null: false
    t.text     "upload_urls_nsfw",                                              default: [],    null: false, array: true
    t.boolean  "nsfw_flag",                                                     default: false, null: false
    t.boolean  "nsfw",                                                          default: false, null: false
    t.text     "upload_artwork_url_nsfw_ids",                                   default: [],    null: false, array: true
    t.boolean  "checked",                                                       default: false, null: false
    t.boolean  "reported",                                                      default: false, null: false
    t.text     "report_users",                                                  default: [],    null: false, array: true
    t.boolean  "user_reported",                                                 default: false, null: false
    t.text     "report_types",                                                  default: [],    null: false, array: true
    t.integer  "report_count",                                                  default: 0,     null: false
    t.boolean  "report_checked",                                                default: false, null: false
    t.datetime "report_created"
    t.datetime "flag_created"
    t.integer  "total_views",                                                   default: 0,     null: false
    t.jsonb    "views",                                                         default: {},    null: false
    t.integer  "user_views",                                                    default: 0,     null: false
    t.integer  "guest_views",                                                   default: 0,     null: false
    t.jsonb    "views_ip",                                                      default: {},    null: false
    t.jsonb    "human_votes",                                                   default: {},    null: false
    t.integer  "human_votes_count",                                             default: 0,     null: false
    t.integer  "human_average_vote",                                            default: 0,     null: false
    t.integer  "human_upvotes",                                                 default: 0,     null: false
    t.integer  "human_downvotes",                                               default: 0,     null: false
    t.jsonb    "human_likes",                                                   default: {},    null: false
    t.integer  "human_likes_count",                                             default: 0,     null: false
    t.jsonb    "human_ratings",                                                 default: {},    null: false
    t.integer  "human_average_rating",                                          default: 0,     null: false
    t.integer  "human_ratings_count",                                           default: 0,     null: false
    t.jsonb    "durations",                                                     default: {},    null: false
    t.jsonb    "durations_ip",                                                  default: {},    null: false
    t.integer  "average_duration",                                              default: 0,     null: false
    t.boolean  "user_viewed",                                                   default: false, null: false
    t.integer  "unique_views",                                                  default: 0,     null: false
    t.float    "hotness",                                                       default: 0.0,   null: false
    t.float    "freshness",                                                     default: 0.0,   null: false
    t.boolean  "removed"
    t.jsonb    "old_properties",                                                default: {}
    t.decimal  "max_price",                             precision: 8, scale: 2, default: "0.0"
    t.decimal  "min_price",                             precision: 8, scale: 2, default: "0.0"
    t.integer  "human_average_simplified_rating",                               default: 0,     null: false
    t.integer  "human_average_simplified_rating_count",                         default: 0,     null: false
    t.string   "uuid",                                                          default: "",    null: false
    t.string   "email",                                                         default: ""
    t.string   "stripe_id",                                                     default: ""
    t.boolean  "waydope",                                                       default: false
    t.index "properties jsonb_path_ops", name: "products_properties_idx", using: :gin
    t.index ["created_at"], name: "index_product_on_created_at", using: :btree
    t.index ["creator"], name: "index_product_on_creator", using: :btree
    t.index ["flag_checked"], name: "index_product_on_flag_checked", using: :btree
    t.index ["hidden"], name: "index_product_on_hidden", using: :btree
    t.index ["og_url_name"], name: "index_product_on_og_url_name", using: :btree
    t.index ["post_type", "main_category", "sub_category", "url"], name: "index_for_product_posts___type_category_subcategory_url", unique: true, using: :btree
    t.index ["sub_category"], name: "index_products_on_sub_category", using: :btree
    t.index ["tsv_body"], name: "index_products_on_tsv_body", using: :gin
    t.index ["url"], name: "index_product_on_url", using: :btree
  end

  create_table "sellers", force: :cascade do |t|
    t.integer "user_id"
    t.jsonb   "sales",                                  default: {},    null: false
    t.text    "new_sales",                              default: [],    null: false, array: true
    t.integer "total",                                  default: 0,     null: false
    t.decimal "total_sales",    precision: 8, scale: 2, default: "0.0", null: false
    t.decimal "total_sub",      precision: 8, scale: 2, default: "0.0", null: false
    t.decimal "total_tax",      precision: 8, scale: 2, default: "0.0", null: false
    t.decimal "total_shipping", precision: 8, scale: 2, default: "0.0", null: false
    t.index ["user_id"], name: "index_sellers_on_user_id", unique: true, using: :btree
  end

  create_table "songs", force: :cascade do |t|
    t.string   "title",                                  default: "",      null: false
    t.string   "artist",                                 default: "",      null: false
    t.text     "description"
    t.text     "submitted_by",                           default: "",      null: false
    t.datetime "created_at",                                               null: false
    t.datetime "updated_at",                                               null: false
    t.string   "url",                                    default: "",      null: false
    t.integer  "user_id"
    t.integer  "link_type",                              default: 0,       null: false
    t.boolean  "user_liked",                             default: false,   null: false
    t.string   "post_type",                              default: "music", null: false
    t.integer  "likes_count",                            default: 0,       null: false
    t.integer  "average_rating",                         default: 100,     null: false
    t.integer  "ratings_count",                          default: 0,       null: false
    t.boolean  "user_rated",                             default: false,   null: false
    t.integer  "comment_count",                          default: 0,       null: false
    t.boolean  "worked",                                 default: false,   null: false
    t.boolean  "deleted",                                default: false,   null: false
    t.boolean  "hidden",                                 default: false,   null: false
    t.string   "main_genre",                             default: "",      null: false
    t.string   "main_genre_display",                     default: "",      null: false
    t.text     "genres",                                 default: [],      null: false, array: true
    t.integer  "average_advanced_rating",                default: 0,       null: false
    t.integer  "average_advanced_rating_count",          default: 0,       null: false
    t.integer  "average_simplified_rating",              default: 0,       null: false
    t.integer  "average_simplified_rating_count",        default: 0,       null: false
    t.integer  "average_lyrics_rating",                  default: 0,       null: false
    t.integer  "average_lyrics_rating_count",            default: 0,       null: false
    t.integer  "average_production_rating",              default: 0,       null: false
    t.integer  "average_production_rating_count",        default: 0,       null: false
    t.integer  "average_originality_rating",             default: 0,       null: false
    t.integer  "average_originality_rating_count",       default: 0,       null: false
    t.integer  "upvotes",                                default: 0,       null: false
    t.integer  "downvotes",                              default: 0,       null: false
    t.integer  "average_vote",                           default: 0,       null: false
    t.integer  "votes_count",                            default: 0,       null: false
    t.integer  "user_voted"
    t.text     "artwork_url",                            default: "",      null: false
    t.boolean  "clicked",                                default: false,   null: false
    t.text     "post_link",                              default: "",      null: false
    t.boolean  "categorized",                            default: false,   null: false
    t.integer  "form",                                   default: 0,       null: false
    t.string   "song"
    t.string   "artwork"
    t.boolean  "flagged",                                default: false,   null: false
    t.string   "og_url_name",                            default: "",      null: false
    t.boolean  "flag_checked",                           default: false,   null: false
    t.string   "deleted_description"
    t.string   "deleted_submitted_by"
    t.string   "deleted_user_id"
    t.string   "old_genre"
    t.boolean  "edited",                                 default: false,   null: false
    t.boolean  "in_deletion",                            default: false,   null: false
    t.boolean  "unindexed",                              default: false,   null: false
    t.tsvector "tsv_body"
    t.jsonb    "likes",                                  default: {},      null: false
    t.jsonb    "ratings",                                default: {},      null: false
    t.jsonb    "votes",                                  default: {},      null: false
    t.text     "marked",                                 default: "",      null: false
    t.text     "stripped",                               default: "",      null: false
    t.integer  "download",                               default: 0,       null: false
    t.string   "download_text",                          default: "",      null: false
    t.string   "download_url",                           default: "",      null: false
    t.string   "time_ago"
    t.boolean  "archived",                               default: false,   null: false
    t.integer  "karma_update",                           default: 0,       null: false
    t.boolean  "voted",                                  default: false,   null: false
    t.boolean  "locked",                                 default: false,   null: false
    t.integer  "average_simplified_rating_variance",     default: 0,       null: false
    t.integer  "average_simplified_rating_deviation",    default: 0,       null: false
    t.integer  "average_advanced_rating_variance",       default: 0,       null: false
    t.integer  "average_advanced_rating_deviation",      default: 0,       null: false
    t.integer  "average_lyrics_rating_variance",         default: 0,       null: false
    t.integer  "average_rating_variance",                default: 0,       null: false
    t.integer  "average_rating_deviation",               default: 0,       null: false
    t.integer  "average_lyrics_rating_deviation",        default: 0,       null: false
    t.integer  "average_production_rating_variance",     default: 0,       null: false
    t.integer  "average_production_rating_deviation",    default: 0,       null: false
    t.integer  "average_originality_rating_variance",    default: 0,       null: false
    t.integer  "average_originality_rating_deviation",   default: 0,       null: false
    t.jsonb    "votes_ip",                               default: {},      null: false
    t.jsonb    "ratings_ip",                             default: {},      null: false
    t.jsonb    "likes_ip",                               default: {},      null: false
    t.text     "link",                                   default: "",      null: false
    t.jsonb    "extras"
    t.string   "link_artwork"
    t.string   "upload_url"
    t.string   "upload_artwork_url"
    t.boolean  "uploaded",                               default: false,   null: false
    t.integer  "title_change",                           default: 0,       null: false
    t.string   "original_link",                          default: "",      null: false
    t.boolean  "featured",                               default: false,   null: false
    t.boolean  "checked",                                default: false,   null: false
    t.boolean  "nsfw_flag",                              default: false,   null: false
    t.boolean  "nsfw",                                   default: false,   null: false
    t.string   "background",                             default: "f",     null: false
    t.boolean  "reported",                               default: false,   null: false
    t.text     "report_users",                           default: [],      null: false, array: true
    t.boolean  "user_reported",                          default: false,   null: false
    t.text     "report_types",                           default: [],      null: false, array: true
    t.integer  "report_count",                           default: 0,       null: false
    t.boolean  "report_checked",                         default: false,   null: false
    t.string   "upload_artwork_url_nsfw",                default: "",      null: false
    t.integer  "download_count",                         default: 0,       null: false
    t.jsonb    "download_users",                         default: {},      null: false
    t.jsonb    "download_ips",                           default: {},      null: false
    t.integer  "direct_download_count",                  default: 0,       null: false
    t.integer  "link_download_count",                    default: 0,       null: false
    t.datetime "report_created"
    t.datetime "flag_created"
    t.text     "colors",                                 default: [],      null: false, array: true
    t.integer  "total_views",                            default: 0,       null: false
    t.integer  "total_plays",                            default: 0,       null: false
    t.jsonb    "views",                                  default: {},      null: false
    t.integer  "user_views",                             default: 0,       null: false
    t.integer  "guest_views",                            default: 0,       null: false
    t.integer  "guest_plays",                            default: 0,       null: false
    t.integer  "user_plays",                             default: 0,       null: false
    t.jsonb    "views_ip",                               default: {},      null: false
    t.jsonb    "plays",                                  default: {},      null: false
    t.jsonb    "plays_ip",                               default: {},      null: false
    t.jsonb    "human_votes",                            default: {},      null: false
    t.integer  "human_votes_count",                      default: 0,       null: false
    t.integer  "human_average_vote",                     default: 0,       null: false
    t.integer  "human_upvotes",                          default: 0,       null: false
    t.integer  "human_downvotes",                        default: 0,       null: false
    t.jsonb    "human_likes",                            default: {},      null: false
    t.integer  "human_likes_count",                      default: 0,       null: false
    t.jsonb    "human_ratings",                          default: {},      null: false
    t.integer  "human_average_rating",                   default: 0,       null: false
    t.integer  "human_ratings_count",                    default: 0,       null: false
    t.integer  "human_advanced_rating",                  default: 0,       null: false
    t.integer  "human_advanced_rating_count",            default: 0,       null: false
    t.integer  "human_average_simplified_rating",        default: 0,       null: false
    t.integer  "human_average_simplified_rating_count",  default: 0,       null: false
    t.integer  "human_average_lyrics_rating",            default: 0,       null: false
    t.integer  "human_average_lyrics_rating_count",      default: 0,       null: false
    t.integer  "human_average_production_rating",        default: 0,       null: false
    t.integer  "human_average_production_rating_count",  default: 0,       null: false
    t.integer  "human_average_originality_rating",       default: 0,       null: false
    t.integer  "human_average_originality_rating_count", default: 0,       null: false
    t.jsonb    "advanced_ratings",                       default: {},      null: false
    t.jsonb    "human_advanced_ratings",                 default: {},      null: false
    t.jsonb    "durations",                              default: {},      null: false
    t.jsonb    "durations_ip",                           default: {},      null: false
    t.integer  "average_duration",                       default: 0,       null: false
    t.boolean  "user_played",                            default: false,   null: false
    t.boolean  "user_viewed",                            default: false,   null: false
    t.integer  "unique_views",                           default: 0,       null: false
    t.float    "hotness",                                default: 0.0,     null: false
    t.float    "freshness",                              default: 0.0,     null: false
    t.boolean  "removed"
    t.string   "store_url"
    t.string   "file_name"
    t.jsonb    "properties",                             default: {}
    t.integer  "human_average_advanced_rating",          default: 0,       null: false
    t.integer  "human_average_advanced_rating_count",    default: 0,       null: false
    t.string   "uuid",                                   default: "",      null: false
    t.index ["artist"], name: "index_songs_on_artist", using: :btree
    t.index ["created_at"], name: "index_songs_on_created_at", using: :btree
    t.index ["flag_checked"], name: "index_songs_on_flag_checked", using: :btree
    t.index ["flagged"], name: "index_songs_on_flagged", using: :btree
    t.index ["hidden"], name: "index_songs_on_hidden", using: :btree
    t.index ["main_genre", "url"], name: "index_songs_on_main_genre_and_url", unique: true, using: :btree
    t.index ["og_url_name"], name: "index_songs_on_og_url_name", using: :btree
    t.index ["tsv_body"], name: "index_songs_on_tsv_body", using: :gin
    t.index ["url"], name: "index_songs_on_url", using: :btree
    t.index ["user_id"], name: "index_songs_on_user_id", using: :btree
  end

  create_table "trackers", force: :cascade do |t|
    t.integer  "user_id"
    t.integer  "last_pageviews"
    t.json     "average_pageviews"
    t.integer  "last_duration"
    t.integer  "average_duration"
    t.jsonb    "durations"
    t.string   "uuid"
    t.string   "last_country"
    t.jsonb    "countries"
    t.string   "last_state"
    t.jsonb    "states"
    t.string   "last_city"
    t.jsonb    "cities"
    t.string   "last_ip_address"
    t.jsonb    "ip_addresses"
    t.string   "last_user_agent"
    t.jsonb    "user_agents"
    t.jsonb    "time_stamps"
    t.integer  "mobile_visits"
    t.integer  "non_mobile_vists"
    t.string   "last_referer"
    t.datetime "last_visit"
    t.jsonb    "visits"
    t.jsonb    "referers"
    t.jsonb    "mobile_duration"
    t.jsonb    "non_mobile_duration"
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
    t.jsonb    "pageviews",           default: {}, null: false
  end

  create_table "users", force: :cascade do |t|
    t.string   "encrypted_password",         default: "",                                              null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",              default: 0,                                               null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                                                                           null: false
    t.datetime "updated_at",                                                                           null: false
    t.string   "username",                   default: "",                                              null: false
    t.string   "firstname"
    t.string   "lastname"
    t.string   "email"
    t.string   "token_string"
    t.boolean  "admin",                      default: false,                                           null: false
    t.json     "token"
    t.boolean  "good_standing",              default: true,                                            null: false
    t.string   "old_password"
    t.string   "login_username",             default: "",                                              null: false
    t.string   "uuid",                       default: "t",                                             null: false
    t.text     "ratings",                    default: [],                                              null: false, array: true
    t.integer  "ratings_count",              default: 0,                                               null: false
    t.text     "ratings_songs",              default: [],                                              null: false, array: true
    t.text     "ratings_songs_ids",          default: [],                                              null: false, array: true
    t.integer  "ratings_songs_count",        default: 0,                                               null: false
    t.integer  "average_rating",             default: 100,                                             null: false
    t.integer  "average_rating_songs",       default: 100,                                             null: false
    t.boolean  "logged_in",                  default: false,                                           null: false
    t.boolean  "locked",                     default: false,                                           null: false
    t.integer  "votes_count",                default: 0,                                               null: false
    t.integer  "average_vote",               default: 0,                                               null: false
    t.integer  "karma",                      default: 0,                                               null: false
    t.text     "news_subs",                  default: ["business", "science", "technology", "sports"], null: false, array: true
    t.text     "music_subs",                 default: ["electronic", "hip-hop", "house", "trap"],      null: false, array: true
    t.text     "video_subs",                 default: ["funny", "feel-good", "real", "oh-shit"],       null: false, array: true
    t.string   "address",                    default: "",                                              null: false
    t.string   "phone_number",               default: "",                                              null: false
    t.string   "city",                       default: "",                                              null: false
    t.string   "state",                      default: "",                                              null: false
    t.tsvector "tsv_body"
    t.jsonb    "songs",                      default: {},                                              null: false
    t.jsonb    "videos",                     default: {},                                              null: false
    t.jsonb    "news_posts",                 default: {},                                              null: false
    t.boolean  "moderator",                  default: false,                                           null: false
    t.boolean  "seller",                     default: false,                                           null: false
    t.boolean  "artist",                     default: false,                                           null: false
    t.boolean  "creator",                    default: false,                                           null: false
    t.boolean  "reporter",                   default: false,                                           null: false
    t.text     "comments",                   default: [],                                                           array: true
    t.boolean  "human",                      default: true,                                            null: false
    t.string   "address_two"
    t.boolean  "approved_seller",            default: false,                                           null: false
    t.integer  "selled_id"
    t.integer  "logins",                     default: 0,                                               null: false
    t.integer  "comment_karma",              default: 0,                                               null: false
    t.integer  "news_karma",                 default: 0,                                               null: false
    t.integer  "music_karma",                default: 0,                                               null: false
    t.integer  "videos_karma",               default: 0,                                               null: false
    t.integer  "products_karma",             default: 0,                                               null: false
    t.string   "gender"
    t.boolean  "verified_email",             default: false,                                           null: false
    t.string   "email_token"
    t.datetime "email_time_stamp"
    t.jsonb    "apparel",                    default: {},                                              null: false
    t.jsonb    "technology",                 default: {},                                              null: false
    t.integer  "post_karma",                 default: 0,                                               null: false
    t.boolean  "hide_nsfw",                  default: false,                                           null: false
    t.boolean  "show_nsfw",                  default: false,                                           null: false
    t.text     "report_types",               default: [],                                              null: false, array: true
    t.text     "reports",                    default: [],                                              null: false, array: true
    t.boolean  "user_reported",              default: false,                                           null: false
    t.integer  "report_count",               default: 0,                                               null: false
    t.text     "report_fouls",               default: [],                                              null: false, array: true
    t.jsonb    "song_downloads",             default: {},                                              null: false
    t.jsonb    "ips",                        default: {},                                              null: false
    t.jsonb    "news_posts_viewed",          default: {},                                              null: false
    t.jsonb    "songs_viewed",               default: {},                                              null: false
    t.jsonb    "videos_viewed",              default: {},                                              null: false
    t.jsonb    "apparel_viewed",             default: {},                                              null: false
    t.jsonb    "technology_viewed",          default: {},                                              null: false
    t.jsonb    "durations",                  default: {},                                              null: false
    t.jsonb    "songs_played",               default: {},                                              null: false
    t.jsonb    "videos_played",              default: {},                                              null: false
    t.jsonb    "trackers",                   default: {},                                              null: false
    t.jsonb    "news_posts_duration",        default: {},                                              null: false
    t.jsonb    "songs_duration",             default: {},                                              null: false
    t.jsonb    "videos_duration",            default: {},                                              null: false
    t.jsonb    "products_duration",          default: {},                                              null: false
    t.integer  "news_post_average_duration", default: 0,                                               null: false
    t.integer  "songs_average_duration",     default: 0,                                               null: false
    t.integer  "videos_average_duration",    default: 0,                                               null: false
    t.integer  "products_average_duration",  default: 0,                                               null: false
    t.jsonb    "consecutive_days",           default: {},                                              null: false
    t.integer  "average_consecutive_days",   default: 0,                                               null: false
    t.integer  "days_visited",               default: 0,                                               null: false
    t.integer  "mobile_vists",               default: 0,                                               null: false
    t.integer  "non_mobile_visits",          default: 0,                                               null: false
    t.datetime "last_visit",                 default: '2017-05-12 00:48:41',                           null: false
    t.integer  "last_consecutive_days",      default: 0,                                               null: false
    t.integer  "since_last_visit"
    t.string   "last_tracker",               default: "",                                              null: false
    t.jsonb    "news_votes",                 default: {},                                              null: false
    t.jsonb    "music_votes",                default: {},                                              null: false
    t.jsonb    "videos_votes",               default: {},                                              null: false
    t.jsonb    "apparel_votes",              default: {},                                              null: false
    t.jsonb    "technology_votes",           default: {},                                              null: false
    t.jsonb    "pageviews",                  default: {},                                              null: false
    t.integer  "average_pageviews",          default: 0,                                               null: false
    t.integer  "last_pageviews",             default: 0,                                               null: false
    t.jsonb    "song_plays",                 default: {}
    t.jsonb    "video_plays",                default: {}
    t.integer  "average_duration",           default: 0
    t.jsonb    "comment_votes",              default: {},                                              null: false
    t.integer  "last_duration",              default: 0
    t.integer  "seller_stage",               default: 0,                                               null: false
    t.string   "stripe_id",                  default: ""
    t.boolean  "is_business",                default: false,                                           null: false
    t.string   "business_name",              default: ""
    t.string   "business_ein",               default: ""
    t.integer  "info_stage",                 default: 0,                                               null: false
    t.boolean  "has_paypal",                 default: false
    t.string   "country",                    default: ""
    t.datetime "dob"
    t.boolean  "ssn_uploaded",               default: false
    t.boolean  "ssn_required",               default: false
    t.integer  "zip"
    t.index ["email"], name: "index_users_on_email", using: :btree
    t.index ["login_username"], name: "index_users_on_login_username", unique: true, using: :btree
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree
    t.index ["token_string"], name: "index_users_on_token_string", unique: true, using: :btree
    t.index ["tsv_body"], name: "index_users_on_tsv_body", using: :gin
    t.index ["username"], name: "index_users_on_username", unique: true, using: :btree
    t.index ["uuid"], name: "index_users_on_uuid", unique: true, using: :btree
  end

  create_table "utm_links", force: :cascade do |t|
    t.string   "medium"
    t.string   "source"
    t.string   "campaign"
    t.integer  "pageview"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "video_categories", force: :cascade do |t|
    t.integer  "count",       default: 0,     null: false
    t.integer  "multiplier",  default: 0,     null: false
    t.text     "top_day",     default: [],    null: false, array: true
    t.text     "top_week",    default: [],    null: false, array: true
    t.text     "top_month",   default: [],    null: false, array: true
    t.text     "top_year",    default: [],    null: false, array: true
    t.text     "top_alltime", default: [],    null: false, array: true
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.string   "title"
    t.string   "url"
    t.boolean  "new_posts",   default: false, null: false
    t.index ["count"], name: "index_video_categories_on_count", using: :btree
    t.index ["created_at"], name: "index_video_categories_on_created_at", using: :btree
    t.index ["url"], name: "index_video_categories_on_url", using: :btree
  end

  create_table "videos", force: :cascade do |t|
    t.string   "title"
    t.text     "description"
    t.text     "submitted_by"
    t.datetime "created_at",                                               null: false
    t.datetime "updated_at",                                               null: false
    t.integer  "user_id"
    t.string   "url",                                   default: "",       null: false
    t.integer  "link_type",                             default: 0,        null: false
    t.string   "post_type",                             default: "videos", null: false
    t.integer  "upvotes",                               default: 0,        null: false
    t.integer  "downvotes",                             default: 0,        null: false
    t.integer  "average_vote",                          default: 0,        null: false
    t.integer  "comment_count",                         default: 0,        null: false
    t.integer  "votes_count",                           default: 0,        null: false
    t.boolean  "worked",                                default: false,    null: false
    t.integer  "user_voted"
    t.boolean  "deleted",                               default: false,    null: false
    t.boolean  "hidden",                                default: false,    null: false
    t.string   "main_category",                         default: "",       null: false
    t.string   "main_category_display",                 default: "",       null: false
    t.text     "categories",                            default: [],       null: false, array: true
    t.integer  "user_rated"
    t.integer  "average_rating",                        default: 100,      null: false
    t.integer  "ratings_count",                         default: 0,        null: false
    t.text     "users_rated",                           default: [],       null: false, array: true
    t.integer  "average_simplified_rating",             default: 0,        null: false
    t.integer  "average_simplified_rating_count",       default: 0,        null: false
    t.boolean  "user_liked",                            default: false,    null: false
    t.integer  "likes_count",                           default: 0,        null: false
    t.text     "artwork_url",                           default: "",       null: false
    t.boolean  "clicked",                               default: false,    null: false
    t.text     "post_link",                             default: "",       null: false
    t.boolean  "categorized",                           default: false,    null: false
    t.integer  "form",                                  default: 0,        null: false
    t.string   "video"
    t.string   "artwork"
    t.boolean  "flagged",                               default: false,    null: false
    t.string   "og_url_name",                           default: "",       null: false
    t.boolean  "flag_checked",                          default: false,    null: false
    t.string   "deleted_description"
    t.string   "deleted_submitted_by"
    t.string   "deleted_user_id"
    t.string   "old_category"
    t.boolean  "edited",                                default: false,    null: false
    t.boolean  "in_deletion",                           default: false,    null: false
    t.boolean  "unindexed",                             default: false,    null: false
    t.tsvector "tsv_body"
    t.jsonb    "likes",                                 default: {},       null: false
    t.jsonb    "ratings",                               default: {},       null: false
    t.jsonb    "votes",                                 default: {},       null: false
    t.text     "marked",                                default: "",       null: false
    t.text     "stripped",                              default: "",       null: false
    t.string   "time_ago"
    t.boolean  "archived",                              default: false,    null: false
    t.integer  "karma_update",                          default: 0,        null: false
    t.boolean  "voted",                                 default: false,    null: false
    t.boolean  "locked",                                default: false,    null: false
    t.jsonb    "votes_ip",                              default: {},       null: false
    t.jsonb    "ratings_ip",                            default: {},       null: false
    t.jsonb    "likes_ip",                              default: {},       null: false
    t.text     "link",                                  default: "",       null: false
    t.jsonb    "extras"
    t.string   "link_artwork"
    t.string   "upload_url"
    t.string   "upload_artwork_url"
    t.boolean  "uploaded",                              default: false,    null: false
    t.integer  "title_change",                          default: 0,        null: false
    t.string   "original_link",                         default: "",       null: false
    t.boolean  "featured",                              default: false,    null: false
    t.boolean  "checked",                               default: false,    null: false
    t.boolean  "nsfw_flag",                             default: false,    null: false
    t.boolean  "nsfw",                                  default: false,    null: false
    t.boolean  "reported",                              default: false,    null: false
    t.text     "report_users",                          default: [],       null: false, array: true
    t.boolean  "user_reported",                         default: false,    null: false
    t.text     "report_types",                          default: [],       null: false, array: true
    t.integer  "report_count",                          default: 0,        null: false
    t.boolean  "report_checked",                        default: false,    null: false
    t.string   "upload_artwork_url_nsfw",               default: "",       null: false
    t.integer  "download_count",                        default: 0,        null: false
    t.jsonb    "download_users",                        default: {},       null: false
    t.jsonb    "download_ips",                          default: {},       null: false
    t.string   "download_url",                          default: "",       null: false
    t.datetime "report_created"
    t.datetime "flag_created"
    t.integer  "total_views",                           default: 0,        null: false
    t.integer  "total_plays",                           default: 0,        null: false
    t.jsonb    "views",                                 default: {},       null: false
    t.integer  "user_views",                            default: 0,        null: false
    t.integer  "guest_views",                           default: 0,        null: false
    t.integer  "guest_plays",                           default: 0,        null: false
    t.integer  "user_plays",                            default: 0,        null: false
    t.jsonb    "views_ip",                              default: {},       null: false
    t.jsonb    "plays",                                 default: {},       null: false
    t.jsonb    "plays_ip",                              default: {},       null: false
    t.jsonb    "human_votes",                           default: {},       null: false
    t.integer  "human_votes_count",                     default: 0,        null: false
    t.integer  "human_average_vote",                    default: 0,        null: false
    t.integer  "human_upvotes",                         default: 0,        null: false
    t.integer  "human_downvotes",                       default: 0,        null: false
    t.jsonb    "human_likes",                           default: {},       null: false
    t.integer  "human_likes_count",                     default: 0,        null: false
    t.jsonb    "human_ratings",                         default: {},       null: false
    t.integer  "human_average_rating",                  default: 0,        null: false
    t.integer  "human_ratings_count",                   default: 0,        null: false
    t.jsonb    "durations",                             default: {},       null: false
    t.jsonb    "durations_ip",                          default: {},       null: false
    t.integer  "average_duration",                      default: 0,        null: false
    t.boolean  "user_played",                           default: false,    null: false
    t.boolean  "user_viewed",                           default: false,    null: false
    t.integer  "unique_views",                          default: 0,        null: false
    t.float    "hotness",                               default: 0.0,      null: false
    t.float    "freshness",                             default: 0.0,      null: false
    t.boolean  "removed"
    t.integer  "human_average_simplified_rating",       default: 0,        null: false
    t.integer  "human_average_simplified_rating_count", default: 0,        null: false
    t.string   "uuid",                                  default: "",       null: false
    t.jsonb    "properties",                            default: {},       null: false
    t.index ["created_at"], name: "index_videos_on_created_at", using: :btree
    t.index ["flag_checked"], name: "index_videos_on_flag_checked", using: :btree
    t.index ["flagged"], name: "index_videos_on_flagged", using: :btree
    t.index ["hidden"], name: "index_videos_on_hidden", using: :btree
    t.index ["main_category", "url"], name: "index_videos_on_main_category_and_url", unique: true, using: :btree
    t.index ["og_url_name"], name: "index_videos_on_og_url_name", using: :btree
    t.index ["tsv_body"], name: "index_videos_on_tsv_body", using: :gin
    t.index ["url"], name: "index_videos_on_url", using: :btree
    t.index ["user_id"], name: "index_videos_on_user_id", using: :btree
  end

end