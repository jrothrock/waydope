class ChangeComments < ActiveRecord::Migration[5.0]
  def change
  	change_table :comments do |t|
  		t.remove :user_id, :song_id
  	end
  	add_column :comments, :commentable_id, :integer, null:false, default:0
  	add_column :comments, :commentable_type, :string, null:false, default:""
  end
end
