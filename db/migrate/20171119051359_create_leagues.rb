class CreateLeagues < ActiveRecord::Migration[5.1]
  def change
    create_table :leagues do |t|
      t.string :name
      t.string :yahoo_id
      t.json :body
      t.timestamps null: false
    end
  end
end
