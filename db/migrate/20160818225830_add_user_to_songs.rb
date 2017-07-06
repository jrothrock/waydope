class AddUserToSongs < ActiveRecord::Migration[5.0]
  def change
  	 add_reference :songs, :user, index: true, foreign_key: true
  end
end
