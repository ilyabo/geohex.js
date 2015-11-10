var tape = require("tape"),
    geohex = require("../");

tape("getZoneByLocation can return hexagon by lat/lot for 0,0", function(test) {
  test.equal(geohex.getZoneByLocation(0.0, 0.0, 0).code, 'OY');
  test.end();
});

