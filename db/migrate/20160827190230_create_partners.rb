class CreatePartners < ActiveRecord::Migration[5.0]
  def change
    create_table :partners do |t|
      t.string :name, null: false, default: ""
      t.string :email, null:false, default: ""
      t.string :contact_name, null:false, default: "" 
      t.string :phone, null:false, default: ""
      t.string :website, null:false, default:""
      t.string :information, null:false, default:""
      t.boolean :read, null:false, default:false
      t.boolean :accepted, null:false, default:false
      t.string :submitted_by
    end
  end
end
