var tape = require("tape"),
    geohex = require("../src/");

var FP_PRECISION = 10;

tape("getZoneByLocation can return hexagon by lat/lot for 0,0", function(test) {
  test.equal(geohex.getZoneByLocation(0.0, 0.0, 0).code, 'OY');
  test.end();
});



tape("getZoneByLocation can return hexagons by lat/lot", function(test) {

  var testCases = require('./testdata_ll2hex.json');

  for (var i in testCases) {
    var tc = testCases[i];
    var lat = tc[0], lon= tc[1], level = tc[2], code = tc[3];

    test.equal(geohex.getZoneByLocation(lat, lon, level).code, code);

  }

  test.end();
});



tape("getZoneByCode can return lat/lon by hexagon code", function(test) {

  var testCases = require('./testdata_hex2ll.json');

  for (var i in testCases) {
    var tc = testCases[i];
    var code = tc[0], lat= tc[1], lon = tc[2], level = code.length - 2;

    var zone = geohex.getZoneByCode(code);
    test.equal(zone.lat.toFixed(FP_PRECISION), lat.toFixed(FP_PRECISION));
    test.equal(zone.lon.toFixed(FP_PRECISION), lon.toFixed(FP_PRECISION));
  }

  test.end();
});




tape("getHexCoords can return coords of hexagon vertices by lat/lon of a point", function(test) {

  var testCases = require('./testdata_ll2polygon.json');

  for (var i in testCases) {
    var tc = testCases[i];

    var lat = tc.shift(), lon = tc.shift(), level = tc.shift();

    var zone = geohex.getZoneByLocation(lat, lon, level);
    var coords = zone.getHexCoords();


    for (var pi = 0; pi < 6; pi++) {
      var cs = coords.shift();
      test.equal(tc.shift().toFixed(FP_PRECISION), cs.lat.toFixed(FP_PRECISION));
      test.equal(tc.shift().toFixed(FP_PRECISION), cs.lon.toFixed(FP_PRECISION));
    }
  }

  test.end();
});



tape("getHexSize can return hexagon sizes by lat/lon of a point", function(test) {

  var testCases = require('./testdata_ll2hexsize.json');

  for (var i in testCases) {
    var tc = testCases[i];

    var lat = tc.shift(), lon = tc.shift(), level = tc.shift(), size = tc.shift();

    var zone = geohex.getZoneByLocation(lat, lon, level);

    test.equal(size.toFixed(FP_PRECISION), zone.getHexSize().toFixed(FP_PRECISION));
  }

  test.end();
});








