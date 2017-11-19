class Score < ActiveRecord::Base
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
    # What about 0 ?
    h.max_by do |key, val|
      if val.first['status'] == 'postevent'
        key.to_i
      else
        0
      end
    end.first.to_i
  end
end
