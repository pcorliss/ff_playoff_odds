class DeleteOldBody < ActiveRecord::Migration[5.2]
  def change
    remove_column :scores, :body, :jsonb
  end
end
