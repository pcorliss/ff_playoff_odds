def yql(query)
  #url = 'https://query.yahooapis.com/v1/public/yql?q='
  #select%20*%20from%20html
  #&format=json
  #&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys
  #select%20*%20from%20html%20where%20url%3D'http%3A%2F%2Fen.wikipedia.org%2Fwiki%2FYahoo'%20and%20xpath%3D'%2F%2Ftable%2F*%5Bcontains(.%2C%22Founder%22)%5D%2F%2Fa'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys

  #protocol = 'https'
  #query.yahooapis.com
  #/v1/public/yql
  #q=select%20*%20from%20fantasysports.leagues%20where%20league_key%3D'238.l.627060'
  #diagnostics=true

end

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
  yaml['yahoo']
end

def session_secret
  yaml['session_secret']
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
