#!/usr/bin/env ruby

require 'csv'
require 'pp'
require 'descriptive_statistics'
require 'rubystats'

PLAYOFF_SPOTS = ($ARGV[1] || 4).to_i
ITERATIONS = ($ARGV[0] || 10).to_i

Team = Struct.new(:owner, :name) do
  def scores
    @scores ||= matches.inject([]) do |acc, match|
      acc << match.home_result if match.home == self && match.complete?
      acc << match.away_result if match.away == self && match.complete?
      acc
    end
  end

  def _compute_results
    return if @wins
    @wins = 0
    @ties = 0
    @losses = 0
    matches.each do |m|
      a = m.home_result
      b = m.away_result
      if m.away == self
        a = m.away_result
        b = m.home_result
      end

      if a == b
        @ties += 1
      elsif a > b
        @wins += 1
      else
        @losses += 1
      end
    end
  end

  def wins
    _compute_results
    @wins
  end

  def losses
    _compute_results
    @losses
  end

  def ties
    _compute_results
    @ties
  end

  def win_pct
    wins * 2 + ties
  end

  def record
    "#{wins}-#{losses}-#{ties}"
  end

  def played
    matches.count(&:complete?)
  end

  def matches(m = $matches)
    @matches ||= m.inject([]) do |acc, match|
      acc << match if match.home == self || match.away == self
      acc
    end
  end

  def clear
    @scores = nil
    @matches = nil
    @wins = nil
    @ties = nil
    @losses = nil
  end

  def points_for
    scores.sum.to_i
  end

  def points_against
    matches.inject(0) do |acc, match|
      acc += match.home_result if match.away == self
      acc += match.away_result if match.home == self
      acc
    end
  end

  def rand_score
    gen = Rubystats::NormalDistribution.new(scores.mean, scores.standard_deviation)
    gen.rng.round
  end

  def to_s
    "#{name[0..14]}\t#{record}\t#{points_for}\t#{points_against}\t#{win_pct}"
  end
end

Match = Struct.new(:week, :home, :away, :home_result, :away_result) do
  def incomplete?
    home_result == 0 && away_result == 0
  end

  def complete?
    !incomplete?
  end

  def to_s
    "Week #{week}: #{away.name} at #{home.name} (#{away_result}-#{home_result})"
  end
end

$teams = {}
$matches = []

csv_results = CSV.parse(STDIN.read, headers: true)

csv_results.each do |result|
  next if result.empty?
  week = result["Week"].to_i
  away_team = result["Away Team"]
  if away_team.include?('(')
    away_team = away_team.split('(').first.strip
  end
  away_owner = result["Away Owner"]
  team = result["Team"]
  if team.include?('(')
    team = team.split('(').first.strip
  end
  owner = result["Owner"]
  score = result["Results"]

  t = $teams[team] ||= Team.new(owner, team)
  a = $teams[away_team] ||= Team.new(away_owner, away_team)

  as, ts = score.split('-').map(&:to_i)
  as ||= 0
  ts ||= 0

  $matches << Match.new(week, t, a, ts, as)
end

#$teams.each do |name, t|
  #puts "T: #{name} ::#{t.scores.sum.to_i}::#{t.points_against}:: #{t.scores.inspect}"
#end

playoff_contenders = {}
ITERATIONS.times do |i|
  test_matches = $matches.map do |m|
    m = m.clone
    if m.incomplete?
      m.home_result = m.home.rand_score
      m.away_result = m.away.rand_score
    end
    m
  end
  cloned_teams = $teams.map do |name, t|
    t = t.clone
    t.clear
    t.matches(test_matches)
    t
  end
  sorted_teams = cloned_teams.sort_by do |t|
    [-t.win_pct, -t.points_for]
  end
  sorted_teams.first(PLAYOFF_SPOTS).each do |t|
    playoff_contenders[t] ||= 0
    playoff_contenders[t] += 1
  end
  #puts test_matches
  #sorted_teams.each do |t|
    #puts t
  #end
  puts "#{i + 1} Iteratons Complete" if i % 10000 == 9999
end

#puts ""

#pp playoff_contenders
playoff_contenders.sort_by do |t, v|
  -v
end.each do |t, v|
  pct = v.to_f / ITERATIONS * 100
  puts "#{t.name} - %0.2f%" % pct
end

puts ""
puts "Iterations: #{ITERATIONS}"
#m = $matches.first
#pp m
#m.home_result = 1
#pp m
