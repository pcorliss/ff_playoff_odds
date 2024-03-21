class LeagueDropBodyColumn < ActiveRecord::Migration[5.2]
  def change
    remove_column :leagues, :body, :jsonb
  end
end
