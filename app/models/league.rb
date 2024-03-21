class League < ActiveRecord::Base
  has_many :scores
  attribute :body_compressed, :binary_hash
  alias_attribute :body, :body_compressed

  def self.find_or_create_from_hash(h)
    h.map do |league_json|
      l = League.find_or_initialize_by(
        yahoo_id: league_json['league_key'],
      )
      if l.new_record?
        l.body = league_json
        l.name = league_json['league_key']
        l.save
      end
      l
    end
  end

  def uses_playoffs?
    body.dig('settings', 'uses_playoff') == '1'
  end

  def week_range
    start_week = body.dig('start_week').to_i
    if uses_playoffs?
      playoff_week = body.dig('settings','playoff_start_week').to_i
      last_week = playoff_week - 1
    else
      last_week = body.dig('end_week').to_i
    end
    (start_week..last_week)
  end
end
