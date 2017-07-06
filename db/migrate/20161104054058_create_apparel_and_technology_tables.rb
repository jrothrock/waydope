class CreateApparelAndTechnologyTables < ActiveRecord::Migration[5.0]
  def change
    create_table :apparels do |t|
      t.string :title, null: false, default: ''
      t.string :creator, null: false, default: ''
      t.string :creator_link, null: false, default: ''
      t.string :submitted_by, null: false, default: ''
      t.decimal :price, precision: 5, scale: 2, null:false, default:0.00
      t.decimal :discount_percentage, precision: 5, scale: 2, null:false, default:0.00
      t.text :purchasers, array:true, null:false, default:[]
      t.string :category, null:false, default: ''
      t.integer :user_id
      t.string :url, null:false, default:''
      t.string :post_type, null:false, default: "apparel"
      t.integer :upvotes, null:false, default:0
      t.integer :downvotes, null:false, default:0
      t.integer :average_vote, null:false, default:0
      t.integer :comment_count, null:false, default:0
      t.text :users_voted, array:true, null:false, default:[]
      t.integer :votes_count, null:false, default:0
      t.integer :freshness, null:false, default:0
      t.integer :user_voted
      t.text :users_voted_type, array:true, null:false, default:[]
      t.boolean :deleted, null:false, default:false
      t.boolean :hidden, null:false, default:false
      t.boolean :deindexed, null:false, default:false
      t.boolean :flagged, null:false, defaukt:false
      t.text :flagged_type, array:true, null:false, default:[]
      t.text :flag_users, array:true, null:false, default:[]
      t.boolean :user_flagged, null:false, default:false
      t.integer :flag_count, null:false, default:0
      t.boolean :flag_checked, null:false, default:false 
      t.string :main_category, null:false, default:''
      t.string :main_category_display, null:false, default:''
      t.text :categories, array:true, null:false, default:[]
      t.text :likes, array:true, null:false, default:[]
      t.boolean :user_liked, null:false, default:true
      t.integer :likes_count, null:false, default:0
      t.integer :user_rated
      t.integer :average_rating, null:false, default:100
      t.integer :ratings_count, null:false, default:0
      t.text :users_rated, array:true, null:false, default:[]
      t.text :ratings_user, array:true, null:false, default:[]
      t.text :ratings, array:true, null:false, default:[]
      t.integer :average_simplified_rating, null:false, default:0
      t.integer :average_simplified_rating_count, null:false, default:0
      t.integer :form, null:false, default:0
      t.string :og_url_name, default:"", null:false
      t.boolean :categorized, null:false, default:false
      t.boolean :worked, null:false, default:false
      t.text :description
      t.boolean :in_deletion, null:false, default:false
      t.timestamps
    end

    create_table :technologies do |t|
      t.string :title, null: false, default: ''
      t.string :creator, null: false, default: ''
      t.string :creator_link, null: false, default: ''
      t.string :submitted_by, null: false, default: ''
      t.decimal :price, precision: 5, scale: 2, null:false, default:0.00
      t.decimal :discount_percentage, precision: 5, scale: 2, null:false, default:0.00
      t.text :purchasers, array:true, null:false, default:[]
      t.string :category, null:false, default: ''
      t.integer :user_id
      t.string :url, null:false, default:''
      t.string :post_type, null:false, default: "technology"
      t.integer :upvotes, null:false, default:0
      t.integer :downvotes, null:false, default:0
      t.integer :average_vote, null:false, default:0
      t.integer :comment_count, null:false, default:0
      t.text :users_voted, array:true, null:false, default:[]
      t.integer :votes_count, null:false, default:0
      t.integer :freshness, null:false, default:0
      t.integer :user_voted
      t.text :users_voted_type, array:true, null:false, default:[]
      t.boolean :deleted, null:false, default:false
      t.boolean :hidden, null:false, default:false
      t.boolean :deindexed, null:false, default:false
      t.boolean :flagged, null:false, defaukt:false
      t.text :flagged_type, array:true, null:false, default:[]
      t.text :flag_users, array:true, null:false, default:[]
      t.boolean :user_flagged, null:false, default:false
      t.integer :flag_count, null:false, default:0
      t.boolean :flag_checked, null:false, default:false 
      t.string :main_category, null:false, default:''
      t.string :main_category_display, null:false, default:''
      t.text :categories, array:true, null:false, default:[]
      t.text :likes, array:true, null:false, default:[]
      t.boolean :user_liked, null:false, default:true
      t.integer :likes_count, null:false, default:0
      t.integer :user_rated
      t.integer :average_rating, null:false, default:100
      t.integer :ratings_count, null:false, default:0
      t.text :users_rated, array:true, null:false, default:[]
      t.text :ratings_user, array:true,null:false, default:[]
      t.text :ratings, array:true, null:false, default:[]
      t.integer :average_simplified_rating, null:false, default:0
      t.integer :average_simplified_rating_count, null:false, default:0
      t.integer :form, null:false, default:0
      t.string :og_url_name, default:"", null:false
      t.boolean :categorized, null:false, default:false
      t.boolean :worked, null:false, default:false
      t.text :description
      t.boolean :in_deletion, null:false, default:false
      t.timestamps
    end

    add_index :apparels, :created_at
    add_index :technologies, :created_at
    add_index :apparels, :flag_checked
    add_index :technologies, :flag_checked
    add_index :apparels, :hidden
    add_index :technologies, :hidden
    add_index :apparels, :og_url_name
    add_index :technologies, :og_url_name
    add_index :apparels, :url
    add_index :technologies, :url
    add_index :apparels, :creator
    add_index :technologies, :creator
    add_index :apparels, :user_id
    add_index :technologies, :user_id

  end
end
