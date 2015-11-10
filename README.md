# Hexagonal geo-coding system

Covering the world with hexagons on several zoom levels:
    
![example](doc/east-coast.png)



Based on the [GeoHex library](http://www.geohex.org/) by [Tadayasu Sasada](https://twitter.com/sa2da).


## How to use

To add the library as an npm dependency to your project, run:

    npm install --save ilyabo/geohex.js#3.0.4
    

Then:

    var geohex = require('geohex')
    
    
## Methods

 
### getZoneByLocation(lat, lon, level)

Get the hexagon zone object for a specific location and zoom level: 
    
    
    var zone = geohex.getZoneByLocation(33.35137950146622,135.6104480957031,2)
    // zone.code will contain 'XM42'
  
  
### getZoneByCode(code)  

Get the hexagon zone object by it's code:
        
    var zone = geohex.getZoneByCode('XM42')
    // zone.lat and zone.lon will be the coordinates of the center of the hexagon
        
        
        
## Zone methods
        
### zone.getHexCoords()
       
Returns the coords of the hexagon vertices:
        
    var coords = geohex.getZoneByCode('XM42').getHexCoords()
