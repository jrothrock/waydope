class AddSongIdBackToComments < ActiveRecord::Migration[5.0]
  def change
  	change_table :comments do |t|
  		t.references :user, index: true, foreign_key: true
  		t.references :song, index: true, foreign_key: true
  	end
  end
end
