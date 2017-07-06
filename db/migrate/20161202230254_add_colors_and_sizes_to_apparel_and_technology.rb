class AddColorsAndSizesToApparelAndTechnology < ActiveRecord::Migration[5.0]
  def change
  add_column :apparels, :size, :string, null:false, default:''
  add_column :apparels, :color, :string, null:false, default:''
  add_column :apparels, :height, :integer, null:false, default:0
  add_column :apparels, :width, :integer, null:false, default:0
  add_column :apparels, :depth, :integer, null:false, default:0
  add_column :apparels, :quantity, :integer, null:false, default:0

  add_column :technologies, :size, :string, null:false, default:''
  add_column :technologies, :color, :string, null:false, default:''
  add_column :technologies, :height, :integer, null:false, default:0
  add_column :technologies, :width, :integer, null:false, default:0
  add_column :technologies, :depth, :integer, null:false, default:0
  add_column :technologies, :quantity, :integer, null:false, default:0
  end
end
