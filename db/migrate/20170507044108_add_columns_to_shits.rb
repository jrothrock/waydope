class AddColumnsToShits < ActiveRecord::Migration[5.0]
  def change
    add_column :songs, :report_created, :datetime
    add_column :comments, :report_created, :datetime
    add_column :videos, :report_created, :datetime
    add_column :products, :report_created, :datetime
    add_column :news_posts, :report_created, :datetime

    add_column :songs, :flag_created, :datetime
    add_column :comments, :flag_created, :datetime
    add_column :videos, :flag_created, :datetime
    add_column :products, :flag_created, :datetime
    add_column :news_posts, :flag_created, :datetime

    add_column :songs, :colors, :text, array:true, null:false, default:[]
  end
end
