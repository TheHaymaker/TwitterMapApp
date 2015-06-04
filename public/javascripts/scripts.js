var app = app || {};

app.data;
app.plottableData = [];

app.width = window.innerWidth;
app.height = window.innerHeight;


app.MakeMap = function makeMap() {
      app.projection = d3.geo.mercator()
            .scale(app.width/7)
            .center([0,0])
            .translate([app.width/2, app.height/2]);

      app.path = d3.geo.path()
            .projection(app.projection);

      app.svg = d3.select(".map-container").append("svg")
          .attr("width", app.width)
          .attr("height", app.height);

      d3.json("world-110m3.json", function(error, topology) {
        app.svg.selectAll("path")
          .data(topojson.feature(topology, topology.objects["world-110m2"]).features)
          .enter()
          .append("path")
          .attr("d", app.path)
          .style("fill", "rgb(214, 173, 91)")
          .attr("stroke", "rgb(132, 114, 77)")
          .attr("stroke-width", 1);
        }); 
    };

app.projectData = function ProjectData(data) {
  console.log(data);

  app.svg.selectAll("circle")
    .data(app.plottableData)
    .enter()
    .append("circle")
    .attr("r", 3)
    .attr("cx", function(d) {
                   return app.projection([d.long, d.lat])[0];
           })
           .attr("cy", function(d) {
                   return app.projection([d.lon, d.lat])[1];
           })
    .attr("stroke", "rgb(200, 84, 107)")
    .attr("stroke-width", 1)
    .attr("fill", 'rgba(200, 84, 107, 0.85)');

  app.svg.selectAll("circle")
    .data(app.plottableData)
    .exit()
    .remove();

};

app.retrieveData = function retrieveData() {

  var params = $('.tweet-search').val();

  $.ajax({
    dataType: 'json',
    url: '/api/tweets',
    data: {query: params},
    success: function(results) {
      console.log(results);

      for (var i = 0; i < results.length; i++) {
        if(results[i].lat) {
          console.log(results[i]);
          app.plottableData.push({name: results[i].handle, lat: results[i].lat, long: results[i].long});
        }
      };

      app.projectData(app.plottableData);

      app.data = results;
      $('.tweet-home').html("");

      for (var i = 0; i < app.data.length; i++) {
        var regex = /(http:..t.co.\w*)/g;
        var str = app.data[i].message;
        var link = str.match(regex);
        var safeMessage = str.replace(regex, "");
        if(link) {
          var bind = $('.tweet-home').append("<li> '" +
           safeMessage + "'<br> Retweets: " + app.data[i].retweet +
            "<br><a href=\"" + link[0] + "\" target=\"_blank\">" +
             link[0] + "</a></li>");
        } else {
          var bind = $('.tweet-home').append("<li> '" +
           app.data[i].message + "'<br> Retweets: " + app.data[i].retweet + "</li>");
        }
      }
    }
  });

};

$('document').ready(function(){
  console.log('ready!');

  app.MakeMap();
        
  $('#query-form').on('submit', function(evt){
    evt.preventDefault();

    app.retrieveData();
          
  });
});