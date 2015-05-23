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

  Geokit::Geocoders::GoogleGeocoder.api_key = 'AIzaSyD0FKozWfNbLIDLadt4aPtgb0500t4ZsEI'

  client = Twitter::REST::Client.new do |config|
    config.consumer_key        = "AtH5GR3xOBNY98U9DiuRHjkxn"
    config.consumer_secret     = "BtX6er4934VYSQnbZSBt2vOWvCcgmupfHmh9bLMUp3Bf33b9ZD"
    config.access_token        = "2398529317-DJz4XZMyjWgAA2hQjMjAC9PiOPPg1bZoABYQNSg"
    config.access_token_secret = "WpP6FBakk28rnJI1zSy4hmQD23xmCr0gPNG6ObN1kS1pS"
  end

  content_type :json
  tweets = []
  # binding.pry
  client.search("#{params[ :query ]}", result_type: "mixed").take(3).each do |tweet|



    puts "----------------------------"
    unless tweet.user.location.nil? || tweet.user.location.strip.empty?
      puts "#{tweet.user.name} AKA #{tweet.user.screen_name} is from #{tweet.user.location}"
      geo = Geokit::Geocoders::GoogleGeocoder.geocode(tweet.user.location)
      tweets.push({message: tweet.full_text, retweet: tweet.retweet_count, place: tweet.user.location, lat: geo.lat, long: geo.lng})
      puts geo.success ? "#{geo.lat}, #{geo.lng}, #{geo.full_address}" : "Unable to find Geo for #{tweet.user.location}"
    else
      tweets.push({message: tweet.text, retweet: tweet.retweet_count, place: "No listed location."})
      puts "#{tweet.user.name} AKA #{tweet.user.screen_name} idk where they are from..."
      puts "No listed location"
    end

  end
  return tweets.to_json
end
