require 'sinatra'
require 'yaml'
require 'oauth2'
require 'haml'
require 'active_support/core_ext/hash'
require 'csv'

require_relative 'helpers.rb'

set :session_secret, session_secret
enable :sessions

get '/hello_world' do
  "Hello World!"
end

get '/' do
  haml :index
end

get '/leagues' do
  league_response = token.get('https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues')
  @leagues = Hash.from_xml(league_response.body)['fantasy_content']['users']['user']['games']['game']['leagues']['league']
  content_type :json
  @leagues.to_json
end

def get_league
  league_response = token.get("https://fantasysports.yahooapis.com/fantasy/v2/league/#{params['league_key']}")
  @league = Hash.from_xml(league_response.body)['fantasy_content']['league']
  @scores = {}
  (1..@league['end_week'].to_i).each do |week|
    p "Week #{week}"
    scoreboard_response = token.get("https://fantasysports.yahooapis.com/fantasy/v2/league/#{params[:league_key]}/scoreboard;week=#{week}")
    @scores[week] = Hash.from_xml(scoreboard_response.body)['fantasy_content']['league']['scoreboard']['matchups']['matchup']
  end
end

get '/leagues/:league_key' do
  content_type :json
  get_league
  @scores.to_json
end

get '/leagues/:league_key/cached' do
  content_type :json

  #require 'pry'
  #binding.pry
  if File.exist? 'scores.json'
    puts "File Exists"
    @scores = JSON.parse(File.read 'scores.json')
  else
    puts "Doesn't exist writing"
    File.open 'scores.json', 'w' do |fh|
      get_league
      fh.print @scores.to_json
    end
  end
  @scores.to_json
end

get '/leagues/:league_key/csv' do
  get_league
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

get '/authorize' do
  redirect client.auth_code.authorize_url(:redirect_uri => redirect_uri)
end

get '/oauth2/callback' do
  access_token = client.auth_code.get_token(params[:code], :redirect_uri => redirect_uri)
  session[:access_token] = access_token.to_hash
  @message = "Successfully authenticated with the server"
  redirect '/leagues'
end
