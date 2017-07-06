class CreateMessages < ActiveRecord::Migration[5.0]
  def change
    create_table :messages do |t|
      t.string :title, null: false, default: ''
      t.string :category, null: false, default: ''
      t.text :body, null: false, default: ''
      t.string :submitted_by, null: false, default: ''

      t.timestamps
    end
  end
end
