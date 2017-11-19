class CreateScores < ActiveRecord::Migration[5.1]
  def change
    create_table :scores do |t|
      t.integer :week
      t.integer :league_id
      t.json :body
      t.timestamps null: false
    end
  end
end
