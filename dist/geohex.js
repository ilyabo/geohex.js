"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.geohex = mod.exports;
  }
})(this, function (exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.getZoneByLocation = getZoneByLocation;
  exports.getZoneByCode = getZoneByCode;
  var geohex = {};
  var h_key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var h_base = 20037508.34;
  var h_deg = Math.PI * (30 / 180);
  var h_k = Math.tan(h_deg);
  var EPS = 1e-10;

  function loc2xy(lon, lat) {
    var x = lon * h_base / 180;
    var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
    y *= h_base / 180;
    return {
      x: x,
      y: y
    };
  }

  function xy2loc(x, y) {
    var lon = x / h_base * 180;
    var lat = y / h_base * 180;
    lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2);
    return {
      lon: lon,
      lat: lat
    };
  }

  function calcHexSize(level) {
    return h_base / Math.pow(3, level + 1);
  }

  function midpoint(p1, p2) {
    return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
  }

  function distance(p1, p2) {
    var dLat = toRadians(p2[1] - p1[1]);
    var dLon = toRadians(p2[0] - p1[0]);
    var lat1 = toRadians(p1[1]);
    var lat2 = toRadians(p2[1]);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var R = 6373;
    return R * c;
  }

  ;

  function toRadians(degree) {
    return degree * Math.PI / 180;
  }

  function Zone(lat, lon, x, y, code) {
    var zone = {
      code: code,
      lat: lat,
      lon: lon,
      centroid: [lat, lon]
    };

    zone.getLevel = function () {
      return this.code.length - 2;
    };

    zone.getHexSize = function () {
      return calcHexSize(this.getLevel() + 2);
    };

    zone.getInnerRadius = function () {
      var coords = this.getCoords();
      return distance(midpoint(coords[0], coords[1]), midpoint(coords[3], coords[4])) * 1000 / 2;
    };

    zone.getOuterRadius = function () {
      var coords = this.getCoords();
      return distance(coords[0], coords[3]) * 1000 / 2;
    };

    zone.getCoords = function () {
      var h_lat = this.lat;
      var h_lon = this.lon;
      var h_xy = loc2xy(h_lon, h_lat);
      var h_x = h_xy.x;
      var h_y = h_xy.y;
      var h_deg = Math.tan(Math.PI * (60 / 180));
      var h_size = this.getHexSize();
      var h_top = xy2loc(h_x, h_y + h_deg * h_size).lat;
      var h_btm = xy2loc(h_x, h_y - h_deg * h_size).lat;
      var h_l = xy2loc(h_x - 2 * h_size, h_y).lon;
      var h_r = xy2loc(h_x + 2 * h_size, h_y).lon;
      var h_cl = xy2loc(h_x - 1 * h_size, h_y).lon;
      var h_cr = xy2loc(h_x + 1 * h_size, h_y).lon;
      return [[h_l, h_lat], [h_cl, h_top], [h_cr, h_top], [h_r, h_lat], [h_cr, h_btm], [h_cl, h_btm]];
    };

    zone.getPolygon = function () {
      var coords = zone.getCoords();
      coords.push(coords[0]);
      return {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [coords]
        },
        properties: {
          code: zone.code
        }
      };
    };

    zone.getWKT = function () {
      var coords = zone.getCoords();
      coords.push(coords[0]);
      return 'POLYGON ((' + coords.map(function (p) {
        return p.join(' ');
      }).join(', ') + '))';
    };

    return zone;
  }

  function getZoneByLocation(lat, lon, level) {
    level += 2;
    var h_size = calcHexSize(level);
    var z_xy = loc2xy(lon, lat);
    var lon_grid = z_xy.x;
    var lat_grid = z_xy.y;
    var unit_x = 6 * h_size;
    var unit_y = 6 * h_size * h_k;
    var h_pos_x = (lon_grid + lat_grid / h_k) / unit_x;
    var h_pos_y = (lat_grid - h_k * lon_grid) / unit_y;
    var h_x_0 = Math.floor(h_pos_x);
    var h_y_0 = Math.floor(h_pos_y);
    var h_x_q = h_pos_x - h_x_0;
    var h_y_q = h_pos_y - h_y_0;
    var h_x = Math.round(h_pos_x);
    var h_y = Math.round(h_pos_y);

    if (h_y_q > -h_x_q + 1) {
      if (h_y_q < 2 * h_x_q && h_y_q > 0.5 * h_x_q) {
        h_x = h_x_0 + 1;
        h_y = h_y_0 + 1;
      }
    } else if (h_y_q < -h_x_q + 1) {
      if (h_y_q > 2 * h_x_q - 1 && h_y_q < 0.5 * h_x_q + 0.5) {
        h_x = h_x_0;
        h_y = h_y_0;
      }
    }

    var h_lat = (h_k * h_x * unit_x + h_y * unit_y) / 2;
    var h_lon = (h_lat - h_y * unit_y) / h_k;
    var z_loc = xy2loc(h_lon, h_lat);
    var z_loc_x = z_loc.lon;
    var z_loc_y = z_loc.lat;

    if (h_base - h_lon < h_size) {
      z_loc_x = 180;
      var h_xy = h_x;
      h_x = h_y;
      h_y = h_xy;
    }

    var h_code = "";
    var code3_x = new Array();
    var code3_y = new Array();
    var code3 = "";
    var code9 = "";
    var mod_x = h_x;
    var mod_y = h_y;

    for (var i = 0; i <= level; i++) {
      var h_pow = Math.pow(3, level - i);

      if (mod_x >= Math.ceil(h_pow / 2)) {
        code3_x[i] = 2;
        mod_x -= h_pow;
      } else if (mod_x <= -Math.ceil(h_pow / 2)) {
        code3_x[i] = 0;
        mod_x += h_pow;
      } else {
        code3_x[i] = 1;
      }

      if (mod_y >= Math.ceil(h_pow / 2)) {
        code3_y[i] = 2;
        mod_y -= h_pow;
      } else if (mod_y <= -Math.ceil(h_pow / 2)) {
        code3_y[i] = 0;
        mod_y += h_pow;
      } else {
        code3_y[i] = 1;
      }
    }

    for (var i = 0; i < code3_x.length; i++) {
      code3 += "" + code3_x[i] + code3_y[i];
      code9 += parseInt(code3, 3);
      h_code += code9;
      code9 = "";
      code3 = "";
    }

    var h_2 = h_code.substring(3);
    var h_1 = h_code.substring(0, 3);
    var h_a1 = Math.floor(h_1 / 30);
    var h_a2 = h_1 % 30;
    h_code = h_key.charAt(h_a1) + h_key.charAt(h_a2) + h_2;
    return new Zone(z_loc_y, z_loc_x, h_x, h_y, h_code);
  }

  function getZoneByCode(code) {
    var level = code.length;
    var h_size = calcHexSize(level);
    var unit_x = 6 * h_size;
    var unit_y = 6 * h_size * h_k;
    var h_x = 0;
    var h_y = 0;
    var h_dec9 = "" + (h_key.indexOf(code.charAt(0)) * 30 + h_key.indexOf(code.charAt(1))) + code.substring(2);

    if (h_dec9.charAt(0).match(/[15]/) && h_dec9.charAt(1).match(/[^125]/) && h_dec9.charAt(2).match(/[^125]/)) {
      if (h_dec9.charAt(0) == 5) {
        h_dec9 = "7" + h_dec9.substring(1, h_dec9.length);
      } else if (h_dec9.charAt(0) == 1) {
        h_dec9 = "3" + h_dec9.substring(1, h_dec9.length);
      }
    }

    var d9xlen = h_dec9.length;

    for (var i = 0; i < level + 1 - d9xlen; i++) {
      h_dec9 = "0" + h_dec9;
      d9xlen++;
    }

    var h_dec3 = "";

    for (var i = 0; i < d9xlen; i++) {
      var h_dec0 = parseInt(h_dec9.charAt(i)).toString(3);

      if (!h_dec0) {
        h_dec3 += "00";
      } else if (h_dec0.length == 1) {
        h_dec3 += "0";
      }

      h_dec3 += h_dec0;
    }

    var h_decx = new Array();
    var h_decy = new Array();

    for (var i = 0; i < h_dec3.length / 2; i++) {
      h_decx[i] = h_dec3.charAt(i * 2);
      h_decy[i] = h_dec3.charAt(i * 2 + 1);
    }

    for (var i = 0; i <= level; i++) {
      var h_pow = Math.pow(3, level - i);

      if (h_decx[i] == 0) {
        h_x -= h_pow;
      } else if (h_decx[i] == 2) {
        h_x += h_pow;
      }

      if (h_decy[i] == 0) {
        h_y -= h_pow;
      } else if (h_decy[i] == 2) {
        h_y += h_pow;
      }
    }

    var h_lat_y = (h_k * h_x * unit_x + h_y * unit_y) / 2;
    var h_lon_x = (h_lat_y - h_y * unit_y) / h_k;
    var h_loc = xy2loc(h_lon_x, h_lat_y);

    if (h_loc.lon > 180 + EPS) {
      h_loc.lon -= 360;
      h_x -= Math.pow(3, level);
      h_y += Math.pow(3, level);
    } else if (h_loc.lon < -(180 - EPS)) {
      h_loc.lon += 360;
      h_x += Math.pow(3, level);
      h_y -= Math.pow(3, level);
    }

    return new Zone(h_loc.lat, h_loc.lon, h_x, h_y, code);
  }
});
