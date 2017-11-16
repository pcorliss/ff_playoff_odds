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
  haml :leagues_index
end

# leagues#show
get '/leagues/:league_key' do
  haml :league
end

get '/leagues.json' do
  league_response = token.get('https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues/settings')
  @leagues = Hash.from_xml(league_response.body)['fantasy_content']['users']['user']['games']['game']['leagues']['league']
  content_type :json
  @leagues.to_json
end

def get_scores
  scoreboard_response = token.get("https://fantasysports.yahooapis.com/fantasy/v2/league/#{params[:league_key]}/scoreboard;week=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20")
  @scores = Hash.from_xml(scoreboard_response.body)['fantasy_content']['league']['scoreboard']['matchups']['matchup'].group_by {|h| h['week']}
end

def get_league
  league_response = token.get("https://fantasysports.yahooapis.com/fantasy/v2/league/#{params['league_key']}/settings")
  @league = Hash.from_xml(league_response.body)['fantasy_content']['league']
end

get '/leagues/:league_key.json' do
  content_type :json
  get_scores
  @scores.to_json
end

get '/leagues/:league_key/cached.json' do
  content_type :json

  #require 'pry'
  #binding.pry
  file_name = "#{params[:league_key]}.json"
  if File.exist? file_name
    puts "File Exists"
    @scores = JSON.parse(File.read file_name)
  else
    puts "Doesn't exist writing"
    File.open file_name, 'w' do |fh|
      get_scores
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
  redirect (session[:last] || '/')
end
