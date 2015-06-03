var width = window.innerWidth;
var height = window.innerHeight;
var dataset = [];

var projection = d3.geo.mercator()
      .scale(width/7)
      .center([0,0])
      .translate([width/2, height/2]);

var path = d3.geo.path()
      .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("world-110m.json", function(error, topology) {
  svg.selectAll("path")
    .data(topojson.feature(topology, topology.objects.countries).features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", "rgb(255, 100, 100)")
    .attr("stroke", "rgb(4, 5, 82)")
    .attr("stroke-width", 2);
  }); 