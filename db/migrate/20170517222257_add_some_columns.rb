class AddSomeColumns < ActiveRecord::Migration[5.0]
  def change
    add_column :impressions, :ips, :jsonb, default:'{}'
    add_column :orders, :properties, :jsonb, default:'{}'
  end
end
