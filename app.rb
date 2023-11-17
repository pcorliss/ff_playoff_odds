require 'sinatra'
require 'yaml'
require 'oauth2'
require 'haml'
require 'active_support/core_ext/hash'
require 'sinatra/activerecord'
require './app/models/league.rb'
require './app/models/score.rb'

require_relative 'helpers.rb'

set :session_secret, session_secret
set :protection, :except => :json_csrf
enable :sessions

get '/' do
  @token = session[:access_token]
  haml :index
end

get '/leagues' do
  token
  haml :leagues_index
end

# leagues#show
get '/leagues/:league_key' do
  validate_league_key
  token
  haml :league
end

get '/sleep' do
  sleep 2
  "Great!"
end

get '/leagues.json' do
  begin
    league_response = token.get('https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues/settings')
    league_response_body = Hash.from_xml(league_response.body)
    @leagues = league_response_body.dig('fantasy_content','users','user','games','game','leagues','league')
    if @leagues.nil?
      puts "WARN: No League Data Found in Response: #{league_response.body}"
      @leagues = []
    end
    @leagues = [@leagues] if @leagues.is_a? Hash
    League.find_or_create_from_hash(@leagues)
  rescue Exception => e
    puts "Error: #{e.backtrace}"
    puts league_response.body
    puts @leagues.inspect
    raise e
  end
  content_type :json
  @leagues.to_json
end

# Can we pull this from the DB to save on time?
get '/leagues/:league_key/json' do
  validate_league_key
  l = League.find_by_yahoo_id(params[:league_key])
  content_type :json

  begin
    scoreboard_response = token.get("https://fantasysports.yahooapis.com/fantasy/v2/league/#{params[:league_key]}/scoreboard;week=#{l.week_range.to_a.join(',')}")
    scoreboard_response_body = Hash.from_xml(scoreboard_response.body)
    raw_scores = scoreboard_response_body.dig('fantasy_content','league','scoreboard','matchups','matchup')
    if raw_scores.nil?
      puts "WARN: No Score Data Found in Response: #{scoreboard_response.body}"
      return [].to_json
    end

    @scores = Hash.from_xml(scoreboard_response.body)['fantasy_content']['league']['scoreboard']['matchups']['matchup'].group_by {|h| h['week']}



    Score.find_or_create_from_hash(@scores, l)
  rescue Exception => e
    puts "Error: #{e.backtrace}"
    puts scoreboard_response.inspect
    puts l.inspect
    puts @scores.inspect
    raise e
  end
  @scores.to_json
end

get '/leagues/:league_key/week/:week' do
  validate_league_key
  @league = League.find_by_yahoo_id(params[:league_key])
  @scores = @league.scores.find_by_week(params[:week].to_i)
  if @scores && @league
    haml :league
  else
    # Cache Miss
    redirect "/leagues/#{params[:league_key]}"
  end
end

get '/demo' do
  @league_key = '371.l.1048861'
  @league = League.find_by_yahoo_id('demo')
  @scores = @league.scores.find_by_week(10)
  haml :league
end

get '/demo/week/10' do
  redirect '/demo'
end

get '/leagues/:league_key/csv' do
  validate_league_key
  scoreboard_response = token.get("https://fantasysports.yahooapis.com/fantasy/v2/league/#{params[:league_key]}/scoreboard;week=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20")
  @scores = Hash.from_xml(scoreboard_response.body)['fantasy_content']['league']['scoreboard']['matchups']['matchup'].group_by {|h| h['week']}
  content_type 'application/csv'
  CSV.generate do |csv|
    csv << ['Week','Away Team','Away Owner','at','Team','Owner','Results']
    @scores.each do |week, matchups|
      next if matchups.nil?
      matchups.each do |matchup|
        home, away = matchup['teams']['team']
        csv << [
          week,
          away['name'],
          away['managers']['manager']['nickname'],
          'at',
          home['name'],
          home['managers']['manager']['nickname'],
          "#{away['team_points']['total']}-#{home['team_points']['total']}"
        ]
      end
    end
  end
end

if ENV['RACK_ENV'] == 'development'
  get '/admin' do
    #@leagues = League.all.includes(:scores)
    @leagues = League.where('yahoo_id LIKE ?', "380%").includes(:scores)
    haml :admin
  end

  get '/admin/league_data/:league_key/json' do
    content_type :json
    League.find_by_yahoo_id(params[:league_key]).to_json
  end

  get '/admin/league_data/:league_key/week/:week/json' do
    content_type :json
    l = League.find_by_yahoo_id(params[:league_key])
    l.scores.find_by_week(params[:week]).to_json
  end
end

get '/authorize' do
  redirect client.auth_code.authorize_url(:redirect_uri => redirect_uri)
end

get '/oauth2/callback' do
  access_token = client.auth_code.get_token(params[:code], :redirect_uri => redirect_uri)
  session[:access_token] = access_token.to_hash
  puts "Access Token: #{access_token.to_hash}"
  @message = "Successfully authenticated with the server"
  next_page = session[:last] || '/leagues'
  session[:last] = nil
  redirect next_page
end

get '/test/error' do
  raise "A million bananas"
end
