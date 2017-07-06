class AddArtworkAndDifferentIframeSizesToSongsAndVideos < ActiveRecord::Migration[5.0]
  def change
  	add_column :songs, :artwork_url, :text, null:false, default: ""
  	add_column :songs, :clicked, :boolean, null:false, default:false
  	add_column :songs, :post_link, :text, null:false, default: ""
  	add_column :videos, :artwork_url, :text, null:false, default: ""
  	add_column :videos, :clicked, :boolean, null:false, default:false
  	add_column :videos, :post_link, :text, null:false, default: ""
  end
end
