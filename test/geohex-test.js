var tape = require("tape"),
    geohex = require("../dist/geohex");

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
    test.equal(zone.centroid[0].toFixed(FP_PRECISION), lat.toFixed(FP_PRECISION));
    test.equal(zone.centroid[1].toFixed(FP_PRECISION), lon.toFixed(FP_PRECISION));
  }

  test.end();
});




tape("getCoords can return coords of hexagon vertices by lat/lon of a point", function(test) {

  var testCases = require('./testdata_ll2polygon.json');

  for (var i in testCases) {
    var tc = testCases[i];

    var lat = tc.shift(), lon = tc.shift(), level = tc.shift();

    var zone = geohex.getZoneByLocation(lat, lon, level);
    var coords = zone.getCoords();


    for (var pi = 0; pi < 6; pi++) {
      var cs = coords.shift();
      var lon = cs.shift(), lat = cs.shift();
      test.equal(lat.toFixed(FP_PRECISION), tc.shift().toFixed(FP_PRECISION));
      test.equal(lon.toFixed(FP_PRECISION), tc.shift().toFixed(FP_PRECISION));
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

    test.equal(zone.getHexSize().toFixed(FP_PRECISION), size.toFixed(FP_PRECISION));
  }

  test.end();
});







tape("getPolygon can return hexagon as GeoJSON polygon", function(test) {

  var zone = geohex.getZoneByLocation(70.777431, 24.915905, 8);
  test.deepEqual(
    zone.getPolygon(),
    { geometry: { coordinates: [ [ [ 24.91490118376265, 70.7777498564315 ], [ 24.915917289031157, 70.77832928094634 ], [ 24.917949499568174, 70.77832928094634 ], [ 24.91896560483668, 70.7777498564315 ], [ 24.917949499568174, 70.7771704151106 ], [ 24.915917289031157, 70.7771704151106 ], [ 24.91490118376265, 70.7777498564315 ] ] ], type: 'Polygon' }, properties: { code: 'YC35718535' }, type: 'Feature' }
  )

  test.end();
});



tape("getWKT can return hexagon as WKT polygon", function(test) {

  var zone = geohex.getZoneByLocation(70.777431, 24.915905, 8);
  test.equal(
    zone.getWKT(),
    'POLYGON ((24.91490118376265 70.7777498564315, 24.915917289031157 70.77832928094634, 24.917949499568174 70.77832928094634, 24.91896560483668 70.7777498564315, 24.917949499568174 70.7771704151106, 24.915917289031157 70.7771704151106, 24.91490118376265 70.7777498564315))'
  )

  test.end();
});








