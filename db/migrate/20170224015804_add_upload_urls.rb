class AddUploadUrls < ActiveRecord::Migration[5.0]
  def change
    add_column :songs, :upload_url, :string
    add_column :songs, :upload_artwork_url, :string
    add_column :videos, :upload_url, :string
    add_column :videos, :upload_artwork_url, :string
    add_column :songs, :uploaded, :boolean, null:false, default:false
    add_column :videos, :uploaded, :boolean, null:false, default:false
    remove_column :users, :bio, :text
    add_column :products, :uploaded, :boolean, null:false, default:false
    add_column :products, :upload_urls, :text, array:true, null:false, default: []
  end
end
