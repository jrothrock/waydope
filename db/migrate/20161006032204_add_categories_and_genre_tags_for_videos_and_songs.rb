class AddCategoriesAndGenreTagsForVideosAndSongs < ActiveRecord::Migration[5.0]
  def self.up
  	drop_table :categories
  	drop_table :post_tags

  	create_table :board_categories do |b|
  		b.string :name, null:false, default: ''
  		b.string :display, null:false, default: ''
  		b.integer :count, null:false, default:0
  		b.integer :multiplier, null:false, default:0
  		b.text :top_day, array:true, null:false, default:[]
  		b.text :top_week, array:true, null:false, default:[]
  		b.text :top_month, array:true, null:false, default:[]
  		b.text :top_year, array:true, null:false, default:[]
  		b.text :top_alltime, array:true, null:false, default:[]
  	end

  	create_table :music_genres do |m|
  		m.string :name, null:false, default: ''
  		m.string :display, null:false, default: ''
  		m.integer :count, null:false, default:0
  		m.integer :multiplier, null:false, default:0
  		m.text :top_day, array:true, null:false, default:[]
  		m.text :top_week, array:true, null:false, default:[]
  		m.text :top_month, array:true, null:false, default:[]
  		m.text :top_year, array:true, null:false, default:[]
  		m.text :top_alltime, array:true, null:false, default:[]
  	end

  	create_table :video_categories do |v|
  		v.string :name, null:false, default: ''
  		v.string :display, null:false, default: ''
  		v.integer :count, null:false, default:0
  		v.integer :multiplier, null:false, default:0
  		v.text :top_day, array:true, null:false, default:[]
  		v.text :top_week, array:true, null:false, default:[]
  		v.text :top_month, array:true, null:false, default:[]
  		v.text :top_year, array:true, null:false, default:[]
  		v.text :top_alltime, array:true, null:false, default:[]
  	end
  	add_index :board_categories, :name
  	add_index :board_categories, :count
  	add_index :music_genres, :name
  	add_index :music_genres, :count
  	add_index :video_categories, :name
  	add_index :video_categories, :count

  	add_column :songs, :categorized, :boolean, null:false, default:false
  	add_column :news_posts, :categorized, :boolean, null:false, default:false
  	add_column :videos, :categorized, :boolean, null:false, default:false

    add_column :songs, :form, :integer, null:false, default:0
    add_column :news_posts, :form, :integer, null:false, default:0
    add_column :videos, :form, :integer, null:false, default:0
  end

  def self.down
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
    drop_table :board_categories
    drop_table :music_genres
    drop_table :video_categories
    remove_column :songs, :categorized
    remove_column :news_posts, :categorized
    remove_column :videos, :categorized
    remove_column :songs, :form
    remove_column :news_posts, :form
    remove_column :videos, :form
  end
end
