var app = app || {};

app.data;
app.plottableData = [];

app.width = window.innerWidth;
app.height = window.innerHeight;


app.MakeMap = function makeMap() {
      app.projection = d3.geo.mercator()
            .scale(app.width/6)
            .center([-10,30])
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
          .attr("d", app.path);
        });
    };

app.projectData = function ProjectData(data) {
  console.log(data);

  var tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden");

  app.svg.selectAll("circle")
    .data(app.plottableData)
    .enter()
    .append("circle")
    .attr("r", 5)
    .attr("cx", function(d) {
                   return app.projection([d.long, d.lat])[0];
           })
           .attr("cy", function(d) {
                   return app.projection([d.long, d.lat])[1];
           })
    .attr("stroke", "rgb(255, 255, 255)")
    .attr("stroke-width", 2)
    .attr("fill", 'rgba(244, 9, 9, 0.9)')
    .on("mouseover", mouseOver)
    .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
    .on("mouseout", mouseOut)
    .on("click", click);

    function mouseOver() {
      d3.select(this)
      .transition()
      .duration(200)
      .attr("stroke-width", 3)
      .attr("stroke", "rgb(0,0,0)")
      .attr("fill", "rgb(115, 189, 255)");

       tooltip.html('');

      tooltip.style("visibility", "hidden");

      // var who = d3.select(this)[0][0].__data__.name;
      // var what = d3.select(this)[0][0].__data__.message;
      // var retweet = d3.select(this)[0][0].__data__.retweet;
      // var img_url = d3.select(this)[0][0].__data__.img_url;

      // tooltip.style("visibility", "visible")
      // .html("<img class=\"tooltip-photo\"src=\"" + img_url + "\"><h3>" +
      //  who + "</h3>" + what +
      //  "<br>Retweeted <strong>" + retweet.toString() + "</strong> times.");
    }

    function mouseOut(){
      d3.select(this)
      .transition()
      .duration(200)
      .attr("stroke-width", 2)
      .attr("stroke", "rgb(255, 255, 255)")
      .attr("fill", 'rgba(244, 9, 9, 0.9)');

     
    }

    function click(){
      var dataset = d3.select(this)[0][0].__data__;
      console.log(dataset);
      var who = dataset.name;
      var what = dataset.message;
      var retweet = dataset.retweet;
      var img_url = dataset.img_url;

      tooltip.html('');

      tooltip.style("visibility", "visible")
      .html("<img class=\"tooltip-photo\"src=\"" + img_url + "\"><h3>" +
       who + "</h3>" + what +
       "<br>Retweeted <strong>" + retweet.toString() + "</strong> times.");
    }

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
      app.plottableData = [];

      for (var i = 0; i < results.length; i++) {
        if(results[i].lat) {
          console.log(results[i]);
          app.plottableData.push({name: results[i].handle, message: results[i].message, retweet: results[i].retweet, img_url: results[i].img_url, lat: results[i].lat, long: results[i].long});
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