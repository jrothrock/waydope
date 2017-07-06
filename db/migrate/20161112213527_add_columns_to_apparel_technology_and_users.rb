class AddColumnsToApparelTechnologyAndUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :apparels, :zip, :integer, null:false, default:0
    add_column :apparels, :city, :string, null:false, default:''
    add_column :apparels, :state, :string, null:false, default:''
    add_column :apparels, :shipping, :decimal, precision: 8, scale: 2
    add_column :apparels, :shipping_type, :string, null:false, default:0
    add_column :apparels, :tax, :decimal, precision: 8, scale: 2
    add_column :apparels, :returns, :boolean, null:false, default:false
    add_column :apparels, :has_site, :boolean, null:false, default:false
    add_column :apparels, :has_variations, :boolean, null:false, default:false
    add_column :apparels, :turnaround_time, :integer, null:false, default:0
    add_column :apparels, :condition, :string, null:false, default: 'nwb'

    add_column :technologies, :zip, :integer, null:false, default:0
    add_column :technologies, :city, :string, null:false, default:''
    add_column :technologies, :state, :string, null:false, default:''
    add_column :technologies, :shipping, :decimal, precision: 8, scale: 2
    add_column :technologies, :shipping_type, :string, null:false, default:0
    add_column :technologies, :tax, :decimal, precision: 8, scale: 2
    add_column :technologies, :returns, :boolean, null:false, default:false
    add_column :technologies, :has_site, :boolean, null:false, default:false
    add_column :technologies, :has_variations, :boolean, null:false, default:false
    add_column :technologies, :turnaround_time, :integer, null:false, default:0
    add_column :technologies, :condition, :string, null:false, default: 'nwb'

    add_column :users, :apparel, :text, array:true, null:false, default:[]
    add_column :users, :technology, :text, array:true, null:false, default:[]
    add_column :users, :address, :string, null:false, default:''
    add_column :users, :city, :string, null:false, default:''
    add_column :users, :state, :string, null:false, default:''
    add_column :users, :zip, :integer, null:false, default:0
    add_column :users, :phone_number, :string, null:false, default:''
  end
end
