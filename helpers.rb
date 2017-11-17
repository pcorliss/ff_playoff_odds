def token
  unless session[:access_token]
    session[:last] = URI.parse(request.url).path
    redirect '/authorize'
  end
  @token ||= OAuth2::AccessToken.from_hash(client, session[:access_token])
  if @token.expired?
    puts "Refreshing Token!"
    @token = @token.refresh!
    session[:access_token] = @token.to_hash
  end
  @token
end

def credentials
  client_id = ENV['yahoo_client_id']
  client_secret = ENV['yahoo_client_secret']

  if client_id && client_secret
    {
      'client_id' => client_id,
      'client_secret' => client_secret,
    }
  else
    yaml['yahoo']
  end
end

def session_secret
  ENV['session_secret'] || yaml['session_secret']
end

def yaml
  @yaml ||= YAML.load_file('credentials.yaml')
end

def client
  @client ||= OAuth2::Client.new(
    credentials['client_id'],
    credentials['client_secret'],
    site: 'https://api.login.yahoo.com',
    authorize_url: '/oauth2/request_auth',
    token_url: '/oauth2/get_token'
  )
end

def redirect_uri
  uri = URI.parse(request.url)
  uri.path = '/oauth2/callback'
  uri.query = nil
  uri.to_s
end

def validate_league_key
  params[:league_key].is_a? String
  unless params[:league_key].match(/^\d{3}\.\w\.\d+$/)
    redirect '/'
  end
end
