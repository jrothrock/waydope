class VariousColumnUpdatesEverywhere < ActiveRecord::Migration[5.0]
  def change
    add_index :news_posts, :reported
    add_index :videos, :reported
    add_index :songs, :reported
    add_index :products, :reported
    add_column :users, :report_count, :integer, null:false, default:0
    add_column :users, :report_fouls, :text, array:true, null:false, default:[]
    remove_column :users, :flag_count, :integer, null:false, default:0
    remove_column :users, :flags_foul, :text, array:true, null:false, default:[]
    add_timestamps(:bot_queue)
    add_column :bot_queue, :in_queue, :boolean, null:false, default:false
    remove_column :songs, :upload_artwork_url_nsfw, :boolean,null:false, default:false
    remove_column :videos, :upload_artwork_url_nsfw, :boolean,null:false, default:false
    add_column :songs, :upload_artwork_url_nsfw, :string,null:false, default:''
    add_column :videos, :upload_artwork_url_nsfw, :string,null:false, default:''
  end
end
