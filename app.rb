require 'bundler'
Bundler.require()

require 'dotenv'
Dotenv.load

# Connection

# dependencies/requirements


# helpers

# Routes
get '/' do

  erb :index

end

get '/api/tweets' do

  # client = Auth.initialize_api()
  # Auth.geo_fy()

  Geokit::Geocoders::GoogleGeocoder.api_key = ENV['GOOGLE_API_KEY']

  client = Twitter::REST::Client.new do |config|
    config.consumer_key        = ENV['TWITTER_CONSUMER_KEY']
    config.consumer_secret     = ENV['TWITTER_CONSUMER_SECRET']
    config.access_token        = ENV['TWITTER_ACCESS_TOKEN']
    config.access_token_secret = ENV['TWITTER_ACCESS_SECRET']
  end

  content_type :json
  tweets = []
  client.search("#{params[ :query ]}", result_type: "recent").take(20).each do |tweet|
    puts "----------------------------"
    unless tweet.user.location.nil? || tweet.user.location.strip.empty?
      puts "#{tweet.user.name} AKA #{tweet.user.screen_name} is from #{tweet.user.location}"
      geo = Geokit::Geocoders::GoogleGeocoder.geocode(tweet.user.location)
      tweets.push({
        message: tweet.full_text,
        # hashtags:
        retweet: tweet.retweet_count,
        followers: tweet.user.followers_count,
        handle: tweet.user.screen_name,
        img_url: tweet.user.profile_background_image_url.to_s,
        place: geo.full_address,
        lat: geo.lat,
        long: geo.lng
        })

      puts geo.success ? "#{geo.lat}, #{geo.lng}, #{geo.full_address}" : "Unable to find Geo for #{tweet.user.location}"
    else
      tweets.push({
        message: tweet.full_text,
        retweet: tweet.retweet_count,
        followers: tweet.user.followers_count,
        handle: tweet.user.screen_name,
        img_url: tweet.user.profile_background_image_url.to_s,
        place: "Location not available."
        })
      puts "#{tweet.user.name} AKA #{tweet.user.screen_name} idk where they are from..."
      puts "No listed location"
    end

  end
  return tweets.to_json
end
