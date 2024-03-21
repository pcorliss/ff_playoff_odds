class Score < ActiveRecord::Base
  attribute :body_compressed, :binary_hash
  alias_attribute :body, :body_compressed

  belongs_to :league

  def self.find_or_create_from_hash(h, l)
    s = l.scores.find_or_initialize_by(
      week: week_from_hash(h),
    )
    if s.new_record?
      s.body = h
      s.save
    end
    s
  end

  def self.week_from_hash(h)
    h.select do |k,v|
      v.first['status'] == 'postevent'
    end.keys.map do |k|
      k.to_i
    end.max || 0
  end

  def inspect
    "#<Score id: #{id}, league_id: #{league_id} week: #{week} Body: #{body.to_s.length}>"
  end
end