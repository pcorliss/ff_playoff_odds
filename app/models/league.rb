class League < ActiveRecord::Base
  has_many :scores

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
end
