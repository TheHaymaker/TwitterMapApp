class Client < ActiveRecord::Base

  client = Twitter::REST::Client.new do |config|
    config.consumer_key        = "U4YqfF929d4poJvOjWQVbQRgr"
    config.consumer_secret     = "N9XDHk65IioxOTWFYNBooxRnkWfi6nwAUc67PzA4p6fzETbLVK"
    config.access_token        = "2398529317-S056Pkh7heukHXQxgkfYaAUGlL7yVpHbWMhcz9y"
    config.access_token_secret = "fGlyd110GlZvKsEItCO5UZmZN3fyBpoO0gTevyP4cHfJo"
  end

end
