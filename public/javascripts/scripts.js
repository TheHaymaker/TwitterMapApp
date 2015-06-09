// ============ N A M E S P A C I N G =================//

var app = app || {};

app.data;
app.plottableData = [];

app.width = window.innerWidth;
app.height = window.innerHeight;
app.active = d3.select(null);

app.tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .on("dblclick", hideMe);

// ============ F U N C T I O N S =================//

function hideMe(){
   if(app.tooltip.style("visibility") === "visible") {
    app.tooltip.style("visibility", "hidden");
   }
}

function clicked(d) {
  if (app.active.node() === this) return reset();
  app.active.classed("active", false);
  app.active = d3.select(this).classed("active", true);

  var bounds = app.path.bounds(d),
  dx = bounds[1][0] - bounds[0][0],
  dy = bounds[1][1] - bounds[0][1],
  x = (bounds[0][0] + bounds[1][0]) / 2,
  y = (bounds[0][1] + bounds[1][1]) / 2;
  app.scale = 0.9 / Math.max(dx / app.width, dy / app.height);
  translate = [app.width / 2 - app.scale * x, app.height / 2 - app.scale * y];

  app.svg.transition()
  .duration(1000)
  .call(app.zoom.translate(translate).scale(app.scale).event);

  d3.select('svg').selectAll('circle').remove();
  app.projectData(app.plottableData);
}

function reset() {
  app.active.classed("active", false);
  app.active = d3.select(null);

  app.svg.transition()
  .duration(1000)
  .call(app.zoom.translate([0,0]).scale(1).event)

  d3.select('svg').selectAll('circle').remove();
  app.projectData(app.plottableData);
}

function zoomed() {
  app.g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  app.g.select(".feature").style("stroke-width", 1.5 / d3.event.scale + "px");
  app.g.select(".mesh").style("stroke-width", 1.5 / d3.event.scale + "px");
  app.g.selectAll("circle").style("stroke-width", 1.5 / d3.event.scale + "px");
  app.g.selectAll("circle").attr("r", 5 / d3.event.scale + "px");
  app.svg.style("stroke-width", 1.5 / d3.event.scale + "px");
  
}

// function drawCities(){
//   app.g.select(".place").remove();

//   d3.json("world-50m-places.json", function(error, topology) {
//         app.g.append("path")
//         .datum(topojson.feature(topology, topology.objects['world-places']))
//         .attr("d", app.path)
//         .attr("class", "place")

//       });
// }

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

// ZOOM NAMESPACED BEHAVIOR
app.zoom = d3.behavior.zoom()
            .translate([0,0])
            .scale(1)
            .scaleExtent([1,8])
            .on("zoom", zoomed);

// NAMESPACED MAP-MAKING FUNCTION
app.MakeMap = function makeMap() {
      app.projection = d3.geo.mercator()
            .scale(app.width/6)
            .center([-10,30])
            .translate([app.width/2, app.height/2]);

      app.path = d3.geo.path()
            .projection(app.projection);

      app.svg = d3.select(".map-container").append("svg")
          .attr("width", app.width)
          .attr("height", app.height)
          .on("click", stopped, true);

      app.svg.append("rect")
        .attr("class", "background")
        .attr("width", app.width)
        .attr("height", app.height)
        .on("click", reset);

        app.g = app.svg.append("g");

          app.svg
            .call(app.zoom) // delete this line to disable free zooming
            .call(app.zoom.event);

      d3.json("world-50m-places.json", function(error, topology) {
        app.g.selectAll("path")
          .data(topojson.feature(topology, topology.objects["world50m"]).features)
          .enter()
          .append("path")
          .attr("d", app.path)
          .attr("class", "feature")
          .on("click", clicked);

          app.g.append("path")
            .datum(topojson.mesh(topology, topology.objects["world50m"], function(a, b) { return a !== b; }))
            .attr("class", "mesh")
            .attr("d", app.path);
        });
    };

app.projectData = function ProjectData(data) {
  console.log(data);

  app.g.selectAll("circle")
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
    .on("mousemove", function(){return app.tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
    .on("mouseout", mouseOut)
    .on("click", click);

    function mouseOver() {
      d3.select(this)
      .transition()
      .duration(200)
      .attr("stroke-width", 3)
      .attr("stroke", "rgb(0,0,0)")
      .attr("fill", "rgb(115, 189, 255)");

      app.tooltip.html('');

      app.tooltip.style("visibility", "hidden");
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

      if(app.tooltip.style("visibility") === "visible") {
        app.tooltip.style("visibility", "hidden");
      } else if(app.tooltip.style("visibility") === "hidden") {
        app.tooltip.style("visibility", "visible");

          var dataset = d3.select(this)[0][0].__data__;
          var who = dataset.name;
          var retweet = dataset.retweet;
          var img_url = dataset.img_url;

          var regex = /(http:..t.co.\w*)/g;
          var regex2 = /(https:..t.co.\w*)/g;
          var what = dataset.message;
          var link = what.match(regex);
          var link2 = what.match(regex2);
          var safeMessage = what.replace(regex, "");
          var safeMessage2 = what.replace(regex2, "");

          app.tooltip.html('');
          
          if (link) {
             var safeMessage = what.replace(regex, "");
              app.tooltip.style("visibility", "visible")
              .html("<img class=\"tooltip-photo\"src=\"" + img_url + "\"><h3>" +
               who + "</h3>" + safeMessage + "<a href=\"" + link[0] + "\" target=\"_blank\">" +
                 link[0] + "</a><br>Retweeted <strong>" +
                retweet.toString() + "</strong> times.");
        } else if(link2) {
          var safeMessage2 = what.replace(regex2, "");
            app.tooltip.style("visibility", "visible")
            .html("<img class=\"tooltip-photo\"src=\"" + img_url + "\"><h3>" +
             who + "</h3>" + safeMessage2 + "<a href=\"" + link[0] + "\" target=\"_blank\">" +
               link[0] + "</a><br>Retweeted <strong>" +
              retweet.toString() + "</strong> times.");
        } else {
            app.tooltip.style("visibility", "visible")
            .html("<img class=\"tooltip-photo\"src=\"" + img_url + "\"><h3>" +
             who + "</h3>" + what + "<br>Retweeted <strong>" +
              retweet.toString() + "</strong> times.");
        }
      }


      // var dataset = d3.select(this)[0][0].__data__;
      // var who = dataset.name;
      // var retweet = dataset.retweet;
      // var img_url = dataset.img_url;

      // var regex = /(http:..t.co.\w*)/g;
      // var regex2 = /(https:..t.co.\w*)/g;
      //   var what = dataset.message;
      //   var link = what.match(regex);
      //   var link2 = what.match(regex2);
      //   var safeMessage = what.replace(regex, "");
      //   var safeMessage2 = what.replace(regex2, "");

      // app.tooltip.html('');
      //   if (link) {
      //      var safeMessage = what.replace(regex, "");
      //     app.tooltip.style("visibility", "visible")
      //     .html("<img class=\"tooltip-photo\"src=\"" + img_url + "\"><h3>" +
      //      who + "</h3>" + safeMessage + "<a href=\"" + link[0] + "\" target=\"_blank\">" +
      //        link[0] + "</a><br>Retweeted <strong>" +
      //       retweet.toString() + "</strong> times.");
      // } else if(link2) {
      //   var safeMessage2 = what.replace(regex2, "");
      //     app.tooltip.style("visibility", "visible")
      //     .html("<img class=\"tooltip-photo\"src=\"" + img_url + "\"><h3>" +
      //      who + "</h3>" + safeMessage2 + "<a href=\"" + link[0] + "\" target=\"_blank\">" +
      //        link[0] + "</a><br>Retweeted <strong>" +
      //       retweet.toString() + "</strong> times.");
      // } else {
      //     app.tooltip.style("visibility", "visible")
      //     .html("<img class=\"tooltip-photo\"src=\"" + img_url + "\"><h3>" +
      //      who + "</h3>" + what + "<br>Retweeted <strong>" +
      //       retweet.toString() + "</strong> times.");
      // }
    }

  app.g.selectAll("circle")
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