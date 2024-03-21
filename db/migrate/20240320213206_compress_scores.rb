class CompressScores < ActiveRecord::Migration[5.2]
  def up
    conn = Score.connection
    scores_to_update = Score.where('body_compressed IS NULL').count
    puts "Compressing #{scores_to_update} scores"

    batch_size = 1000
    i = 0
    st = Time.now

    while Score.where('body_compressed IS NULL').exists? do
      updates = {}
      conn.exec_query("SELECT id, body FROM scores WHERE body_compressed IS NULL LIMIT $1", 'SQL', [[nil,batch_size]], prepare: true).each do |row|
        compressed = ActiveSupport::Gzip.compress(row['body'])
        escaped = PG::Connection.escape_bytea(compressed)
        updates[row['id']] = escaped
      end;nil

      res = conn.execute("
        UPDATE scores
        SET body_compressed = v.body_compressed
        FROM (VALUES #{updates.map { |k,v| "(#{k}, CAST('#{v}' AS bytea))" }.join(', ')} ) v(id, body_compressed)
        WHERE v.id = scores.id;
      ");nil

      i += res.cmd_tuples
      duration = Time.now - st
      puts "\tUpdated #{i}/#{scores_to_update} scores in #{duration}s. #{i.to_f / duration} scores/s"
    end
  end

  def down
    Score.connection.execute("UPDATE scores SET body_compressed = NULL")
  end
end
