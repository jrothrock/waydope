class CreateOrdersTable < ActiveRecord::Migration[5.0]
  def change
    create_table :orders do |t|
      t.integer :status, null:false, default:1
      t.integer :user_id
      t.text :products, array:true
      t.integer :sub_total, precision: 12, scale: 3, null:false, default:0.00
      t.integer :shipping, precision: 12, scale: 3, null:false, default:0.00
      t.integer :tax, precision: 12, scale: 3, null:false, default:0.00
      t.integer :total, precision: 12, scale: 3, null:false, default:0.00
    end
    remove_column :apparels, :price, precision: 5, scale: 2, null:false, default:0.00
    remove_column :apparels, :discount_percentage, precision: 5, scale: 2, null:false, default:0.00
    remove_column :technologies, :price, precision: 5, scale: 2, null:false, default:0.00
    remove_column :technologies, :discount_percentage, precision: 5, scale: 2, null:false, default:0.00

    add_column :apparels, :price, :integer, precision: 12, scale: 3, null:false, default:0.00
    add_column :apparels, :sale_price, :integer, precision: 12, scale: 3, null:false, default:0.00
    add_column :apparels, :discount_percentage, :integer, precision: 12, scale: 3, null:false, default:0.00
    add_column :technologies, :price, :integer, precision: 12, scale: 3, null:false, default:0.00
    add_column :technologies, :sale_price, :integer, precision: 12, scale: 3, null:false, default:0.00
    add_column :technologies, :discount_percentage, :integer, precision: 12, scale: 3, null:false, default:0.00

    add_column :comments, :title, :string
    add_column :notifications, :title, :string
  end
end
