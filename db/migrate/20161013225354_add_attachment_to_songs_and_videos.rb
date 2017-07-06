class AddAttachmentToSongsAndVideos < ActiveRecord::Migration[5.0]
  def up
    add_column :songs, :song, :string
    add_column :songs, :artwork, :string
    add_column :videos, :video, :string
    add_column :videos, :artwork, :string
  end

  def down
    remove_column :songs, :song
    remove_column :songs, :artwork
    remove_column :videos, :video
    remove_column :videos, :artwork
  end
end
