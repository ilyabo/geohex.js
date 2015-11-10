# Hexagonal geo-coding system

[![Build Status](https://travis-ci.org/ilyabo/geohex.js.svg?branch=master)](https://travis-ci.org/ilyabo/geohex.js)

Covering the world with hexagons on several zoom levels:
    
![example](doc/east-coast.png)



Based on the [GeoHex library](http://www.geohex.org/) by [Tadayasu Sasada](https://twitter.com/sa2da).


This is a sister library for [this Scala version](https://github.com/teralytics/geohex).


## Why hexagons?

There are several advantages hexagonal grids may have over quadratic ones for data visualization, most importantly: 

  * better sampling efficiency
  * better perception (visually less biased).

![squares vs hexagons](doc/why-hexagons.png)

>  Why hexagons? There are many reasons for using hexagons, at least over squares. Hexagons have symmetry of nearest neighbors which is lacking in square bins. Hexagons are the maximum number of sides a polygon can have for a regular tesselation of the plane, so in terms of packing a hexagon is 13% more efficient for covering the plane than squares. This property translates into better sampling efficiency at least for elliptical shapes. Lastly hexagons are visually less biased for displaying densities than other regular tesselations. For instance with squares our eyes are drawn to the horizontal and vertical lines of the grid.

https://cran.r-project.org/web/packages/hexbin/vignettes/hexagon_binning.pdf


>    The data model of quadratic cells can cause problems of direction bias or dependence in certain raster analyses that consist of computing new parameters based on a raster cell neighbourhood.
>    ...
>    Hexagon depictions can help to disperse the perception of privileged directions in field model data.
    
http://www.ralphstraumann.ch/blog/2013/10/hexagons-quasi-maps-and-cartograms/





## How to use

To add the library as an npm dependency to your project, run:

    npm install --save ilyabo/geohex.js#3.0.4
    

Then:

    var geohex = require('geohex')
    
    
## Methods

 
### getZoneByLocation(lat, lon, level)

Get the hexagon zone object for a specific location and zoom level: 
    
    
    var zone0 = geohex.getZoneByLocation(33.35, 135.61, 0)
    // zone0.code equals to 'XM'
    
    var zone1 = geohex.getZoneByLocation(33.35, 135.61, 1)
    // zone1.code equals to 'XM4'
          
    var zone2 = geohex.getZoneByLocation(33.35, 135.61, 2)
    // zone2.code equals to 'XM42'
      
    var zone3 = geohex.getZoneByLocation(33.35, 135.61, 3)
    // zone3.code equals to 'XM428'
  
  
### getZoneByCode(code)  

Get the hexagon zone object by it's code:
        
    var zone = geohex.getZoneByCode('XM428')
        
        
## Zone props and methods
        
### zone.code

The string code of the hexagon.


### zone.lat, zone.lon

The geographic coordinates of the center of the hexagon.


### zone.x, zone.y

The coordinates of the hexagon in the hexagonal grid.



### zone.getHexCoords()
       
Returns the coords of the hexagon vertices:
        
    var coords = geohex.getZoneByCode('XM428').getHexCoords()
