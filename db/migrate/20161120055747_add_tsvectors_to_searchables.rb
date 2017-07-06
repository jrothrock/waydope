class AddTsvectorsToSearchables < ActiveRecord::Migration[5.0]
  def up
    add_column :news_posts, :tsv_body, :tsvector
    add_index(:news_posts, :tsv_body, using: 'gin')

    add_column :songs, :tsv_body, :tsvector
    add_index(:songs, :tsv_body, using: 'gin')

    add_column :videos, :tsv_body, :tsvector
    add_index(:videos, :tsv_body, using: 'gin')

    add_column :apparels, :tsv_body, :tsvector
    add_index(:apparels, :tsv_body, using: 'gin')
    
    add_column :technologies, :tsv_body, :tsvector
    add_index(:technologies, :tsv_body, using: 'gin')

    add_column :users, :tsv_body, :tsvector
    add_index(:users, :tsv_body, using: 'gin')
  end
  def down
    remove_index :news_posts, name: "index_news_posts_on_tsv_body"
    remove_index :songs, name: "index_songs_on_tsv_body"
    remove_index :videos, name: "index_videos_on_tsv_body"
    remove_index :apparels, name: "index_apparels_on_tsv_body"
    remove_index :technologies, name: "index_technologies_on_tsv_body" 
    remove_index :users, name: "index_users_on_tsv_body"

    remove_column :news_posts, :tsv_body
    remove_column :songs, :tsv_body
    remove_column :videos, :tsv_body
    remove_column :apparels, :tsv_body
    remove_column :users, :tsv_body
    remove_column :technologies, :tsv_body
  end
end
