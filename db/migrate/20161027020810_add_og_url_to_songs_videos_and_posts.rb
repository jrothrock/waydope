class AddOgUrlToSongsVideosAndPosts < ActiveRecord::Migration[5.0]
  def change
  	add_column :songs, :og_url_name, :string, null:false, default:''
  	add_column :news_posts, :og_url_name, :string, null:false, default:''
  	add_column :videos, :og_url_name, :string, null:false, default:''

  	add_index :songs, :og_url_name
  	add_index :news_posts, :og_url_name
  	add_index :videos, :og_url_name

  end
end
