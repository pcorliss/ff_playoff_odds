require 'sinatra'
require 'yaml'
require 'oauth2'
require 'haml'
require 'active_support/core_ext/hash'
require_relative 'helpers.rb'

set    :session_secret, session_secret
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

get '/leagues/:league_key' do
  league_response = token.get("https://fantasysports.yahooapis.com/fantasy/v2/league/#{params['league_key']}")
  @league = Hash.from_xml(league_response.body)['fantasy_content']['league']
  @scores = {}
  (1...@league['current_week'].to_i).each do |week|
    p "Week #{week}"
    scoreboard_response = token.get("https://fantasysports.yahooapis.com/fantasy/v2/league/#{params[:league_key]}/scoreboard;week=#{week}")
    @scores[week] = Hash.from_xml(scoreboard_response.body)['fantasy_content']['league']['scoreboard']['matchups']['matchup']
  end
  content_type :json
  @scores.to_json
end

get '/authorize' do
  redirect client.auth_code.authorize_url(:redirect_uri => redirect_uri)
end

get '/oauth2/callback' do
  access_token = client.auth_code.get_token(params[:code], :redirect_uri => redirect_uri)
  session[:access_token] = access_token.to_hash
  @message = "Successfully authenticated with the server"
  redirect '/check'


  # parsed is a handy method on an OAuth2::Response object that will 
  # intelligently try and parse the response.body
  #@email = access_token.get('https://www.googleapis.com/userinfo/email?alt=json').parsed
end
