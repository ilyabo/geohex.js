var tape = require("tape"),
    geohex = require("../dist/geohex"),
    turf = require("turf");

require('./in-delta');


tape("getInnerRadius returns inner radius of hexagon", function(test) {
  test.inDelta(geohex.getZoneByLocation(40.737321, -73.993439, 8).getInnerRadius(), 148.3, 1e-1);
  test.inDelta(geohex.getZoneByLocation(70.777431, 24.915905, 8).getInnerRadius(), 64.5, 1e-1);
  test.inDelta(geohex.getZoneByLocation(0, 0, 8).getInnerRadius(), 195.8, 1e-1);
  test.end();
});

tape("getOuterRadius returns inner radius of hexagon", function(test) {
  test.inDelta(geohex.getZoneByLocation(40.737321, -73.993439, 8).getOuterRadius(), 171.3, 1e-1);
  test.inDelta(geohex.getZoneByLocation(70.777431, 24.915905, 8).getOuterRadius(), 74.4, 1e-1);
  test.inDelta(geohex.getZoneByLocation(0, 0, 8).getOuterRadius(), 226.0, 1e-1);
  test.end();
});

