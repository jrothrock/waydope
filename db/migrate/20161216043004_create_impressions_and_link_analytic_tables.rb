class CreateImpressionsAndLinkAnalyticTables < ActiveRecord::Migration[5.0]
  def change
    create_table :impressions, :force => true do |t|
      t.string :impressionable_type
      t.integer :impressionable_id
      t.integer :user_id
      t.string :ip_address
      t.integer :pageview
      t.timestamps
    end
    create_table :utm_links do |t|
      t.string :medium
      t.string :source
      t.string :campaign
      t.integer :pageview
      t.timestamps
    end
    add_column :orders, :quantities, :jsonb, null:false, default: '{}'
    remove_column :products, :ratings, :text, array:true, null:false, default:[]
    add_column :products, :ratings, :jsonb, null:false, default: '{}'
    add_column :products, :fit, :jsonb, null:false, default: '{}'
    add_column :products, :fit_count, :integer, null:false, default:0
    add_column :products, :lock_version, :integer, default: 0, null: false
    add_column :photos, :user_uuid, :string, null:false, default:''
    add_column :products, :featured, :boolean, default:false, null:false
    add_column :users, :apparels, :jsonb, null:false, default: '{}'
    add_column :users, :technologies, :jsonb, null:false, default: '{}'
  end
end
