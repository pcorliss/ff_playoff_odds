class LeagueAddCompressedBody < ActiveRecord::Migration[5.2]
  def change
    add_column :leagues, :body_compressed, :binary
  end
end
