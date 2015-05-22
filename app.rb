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


  client = Twitter::REST::Client.new do |config|
    config.consumer_key        = "U4YqfF929d4poJvOjWQVbQRgr"
    config.consumer_secret     = "N9XDHk65IioxOTWFYNBooxRnkWfi6nwAUc67PzA4p6fzETbLVK"
    config.access_token        = "2398529317-S056Pkh7heukHXQxgkfYaAUGlL7yVpHbWMhcz9y"
    config.access_token_secret = "fGlyd110GlZvKsEItCO5UZmZN3fyBpoO0gTevyP4cHfJo"
  end

  content_type :json
  tweets = []
  client.search('blackhawks', result_type: "mixed").take(5).each do |tweet|

     tweets.push({message: tweet.text, retweet: tweet.retweet_count})

  end
  tweets.to_json
end
