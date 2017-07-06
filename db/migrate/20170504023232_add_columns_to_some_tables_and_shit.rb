class AddColumnsToSomeTablesAndShit < ActiveRecord::Migration[5.0]
  def change
    add_column :songs, :download_count, :integer, null:false, default:0
    add_column :videos, :download_count, :integer, null:false, default:0
    add_column :songs, :download_users, :jsonb, null:false, default:'{}'
    add_column :songs, :download_ips, :jsonb, null:false, default:'{}'
    add_column :videos, :download_users, :jsonb, null:false, default:'{}'
    add_column :videos, :download_ips, :jsonb, null:false, default:'{}'
    add_column :videos, :download_url, :string, null:false, default:'{}'
    add_column :songs, :direct_download_count, :integer, null:false, default:0
    add_column :songs, :link_download_count, :integer, null:false, default:0
    add_column :users, :song_downloads, :jsonb, null:false, default: "{}"
  end
end
