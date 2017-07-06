class MakeCommentsPolymorphic < ActiveRecord::Migration[5.0]
  def change
  	change_table :comments do |t|
  		t.references :commentable, polymorphic: true, index: true
  	end
  	remove_column :comments, :song_id, :integer
  	remove_column :comments, :news_post_id, :integer
  	remove_column :comments, :video_id, :integer
  end
end
