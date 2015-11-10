# Hexagonal geo-coding system

Covering the world with hexagons on several zoom levels:
    
![example](doc/east-coast.png)



Based on the [GeoHex library](http://www.geohex.org/) by [Tadayasu Sasada](https://twitter.com/sa2da).


## How to use

To add the library as an npm dependency to your project, run:

    npm install --save ilyabo/geohex.js#3.0.3
    

Then:

    var geohex = require('geohex')
    
    
## Methods

 
### getZoneByLocation(lat, lon, level)

Get the hexagon zone object for a specific location and zoom level: 
    
        var zone = geohex.getZoneByLocation(lat, lon, level);
  
  
### getZoneByCode(code)  

Get the hexagon zone object by it's code:
        
        var zone = geohex.getZoneByCode(code)
        
        
        
## Zone methods
        
### zone.getHexCoords()
       
Returns the coords of the hexagon vertices by lat/lon of a point
        
        var coords = zone.getHexCoords();
