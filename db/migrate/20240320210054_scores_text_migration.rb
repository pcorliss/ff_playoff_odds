class ScoresTextMigration < ActiveRecord::Migration[5.2]
  def change
    add_column :scores, :body_compressed, :binary
  end
end