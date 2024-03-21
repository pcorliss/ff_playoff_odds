class LeagueCompressBody < ActiveRecord::Migration[5.2]
  def up
    conn = League.connection
    leagues_to_update = League.where('body_compressed IS NULL').count
    puts "Compressing #{leagues_to_update} leagues"

    batch_size = 1000
    i = 0
    st = Time.now

    while League.where('body_compressed IS NULL').exists? do
      updates = {}
      conn.exec_query("SELECT id, body FROM leagues WHERE body_compressed IS NULL LIMIT $1", 'SQL', [[nil,batch_size]], prepare: true).each do |row|
        compressed = ActiveSupport::Gzip.compress(row['body'])
        escaped = PG::Connection.escape_bytea(compressed)
        updates[row['id']] = escaped
      end;nil

      res = conn.execute("
        UPDATE leagues
        SET body_compressed = v.body_compressed
        FROM (VALUES #{updates.map { |k,v| "(#{k}, CAST('#{v}' AS bytea))" }.join(', ')} ) v(id, body_compressed)
        WHERE v.id = leagues.id;
      ");nil

      i += res.cmd_tuples
      duration = Time.now - st
      puts "\tUpdated #{i}/#{leagues_to_update} leagues in #{duration}s. #{i.to_f / duration} leagues/s"
    end
  end

  def down
    League.connection.execute("UPDATE leagues SET body_compressed = NULL")
  end
end
