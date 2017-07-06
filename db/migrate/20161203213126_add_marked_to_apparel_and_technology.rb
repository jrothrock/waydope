class AddMarkedToApparelAndTechnology < ActiveRecord::Migration[5.0]
  def change
    add_column :apparels, :marked, :text, null:false, default:''
    add_column :apparels, :stripped, :text, null:false, default:''
    add_column :technologies, :marked, :text, null:false, default:''
    add_column :technologies, :stripped, :text, null:false, default:''
  end
end
