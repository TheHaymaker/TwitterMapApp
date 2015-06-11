#Car-Tweet-ographer

![Screenshot](https://raw.github.com/TheHaymaker/TwitterMapApp/master/twittermapdemo.gif)

##Description:
Using Twitter's Search API, this app identitifies a Twitter User's profile location (if any listed), geocodes it using Google's Geocoder and plots the lat/long values on a global map rendered in an SVG using the D3.js visualization engine, Topojson and the Geospatial Data Abstraction Library (GDAL) toolset using open-sourced shapefiles from Natural Earth.

#Features:
  - User-directed Search
  - Client-side AJAX call
  - Sinatra/Ruby server with application specific API call
  - D3 mercator map projection in 50m resolution (with major city data bound to dataset for future use)
  - Touchpad and click-to-zoom functionality with scalable/responsive data points
  - Click-initiated tooltip/pop-up events with bound data
  - Regular expression isolated links for exploration/navigation to new tabs

