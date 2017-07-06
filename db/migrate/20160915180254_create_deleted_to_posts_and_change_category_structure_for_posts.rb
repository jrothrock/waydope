class CreateDeletedToPostsAndChangeCategoryStructureForPosts < ActiveRecord::Migration[5.0]
  def change
    add_column :news_posts, :deleted, :boolean, null:false, default:false
    add_column :songs, :deleted, :boolean, null:false, default:false
    add_column :videos, :deleted, :boolean, null:false, default:false

    add_column :news_posts, :hidden, :boolean, null:false, default:false
    add_column :songs, :hidden, :boolean, null:false, default:false
    add_column :videos, :hidden, :boolean, null:false, default:false

    remove_column :news_posts, :category, :string
    add_column :news_posts, :main_category, :string, null:false, default: ''
    add_column :news_posts, :main_category_display, :string, null:false, default: ''
    add_column :news_posts, :categories, :text, array:true, null:false, default: []

    remove_column :songs, :genre, :string
    add_column :songs, :main_genre, :string, null:false, default:''
    add_column :songs, :main_genre_display, :string, null:false, default: ''
    add_column :songs, :genres, :text, array:true, null:false, default: []

    remove_column :videos, :category, :string
    add_column :videos, :main_category, :string, null:false, default:''
    add_column :videos,  :main_category_display, :string, null:false, default:''
    add_column :videos, :categories, :text, array:true, null:false, default:[]

    add_column :users, :news_subs, :text, array:true, null:false, default: ['business','science','technology','sports']
    add_column :users, :music_subs, :text, array:true, null:false, default: ['electronic','hip-hop','house','trap']
    add_column :users, :video_subs, :text, array:true, null:false, default: ['funny','feel-good','real','oh-shit']

    create_table :categories do |c|
    	c.string :name, null:false, default: ''
    	c.integer :subscribers, null:false, default:0
    	c.integer :multiplier, null:false, default:0
    	c.string :type, null:false
    end

    create_table :post_tags do |t|
    	t.string :category, null:false, default:''
    	t.integer :news_post_id, null:false, default:0
    end
    add_index :post_tags, :news_post_id
  end
end
