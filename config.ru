require './app.rb'
require 'raven'

Raven.configure do |config|
  config.server = ENV['SENTRY_DSN'] if ENV['SENTRY_DSN']
end

use Raven::Rack
run Sinatra::Application
