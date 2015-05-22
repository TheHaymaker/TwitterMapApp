require 'bundler'
Bundler.require()

# Connection

# dependencies/requirements

# helpers

# Routes

get '/' do

  erb :index

end


get '/api/tweets' do
  content_type :json

  client.search("blackhawks", result_type: "recent").take(3).each do |tweet|
    puts tweet
  end

end
