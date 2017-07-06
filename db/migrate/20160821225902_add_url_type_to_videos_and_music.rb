class AddUrlTypeToVideosAndMusic < ActiveRecord::Migration[5.0]
  def change
  	add_column :songs, :link_type, :integer, null: false, default: 0
  	add_column :videos, :link_type, :integer, null: false, default: 0
  end
end
