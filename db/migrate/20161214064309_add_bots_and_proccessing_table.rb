class AddBotsAndProccessingTable < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :human, :boolean, null:false, default:true

    create_table :bot_queue do |t|
      t.integer :queue_type, null:false, default:1
      t.string :post_type, null:false, default:''
      t.string :value_string
      t.boolean :value_boolean
      t.integer :value_integer
      t.integer :user_uuid
      t.timestamp :run_at
    end
  end
end
