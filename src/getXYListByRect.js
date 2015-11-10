/// COPYRIGHT 2013 GEOHEX Inc. ///
/// GEOHEX by @sa2da (http://geohex.net) is licensed under Creative Commons BY-SA 2.1 Japan License. ///

// RECT（矩形）内のHEXリスト取得（[{"x":x, "y":y}]形式）
function getXYListByRect(_min_lat, _min_lon, _max_lat, _max_lon, _level , _buffer){
	
//	var h_deg = Math.tan(Math.PI * (60 / 180));
	var h_base = 20037508.34;
	var base_steps =  Math.pow(3, _level+2)*2;
	var list = [];
	var steps_x =0;
	var steps_y =0;
	
	var min_lat=(_min_lat > _max_lat)?_max_lat:_min_lat;
	var max_lat=(_min_lat < _max_lat)?_max_lat:_min_lat;
	var min_lon = _min_lon;
	var max_lon = _max_lon;
	
	if(_buffer){
		var min_xy = GEOHEX.loc2xy(min_lon, min_lat);
		var max_xy = GEOHEX.loc2xy(max_lon, max_lat);
		var x_len = (max_lon>=min_lon)?Math.abs(max_xy.x - min_xy.x):Math.abs(h_base + max_xy.x - min_xy.x + h_base);
		var y_len = Math.abs(max_xy.y - min_xy.y);
		var min_coord = GEOHEX.xy2loc((min_xy.x - x_len/2)%(h_base*2), min_xy.y - y_len/2);
		var max_coord = GEOHEX.xy2loc((max_xy.x + x_len/2)%(h_base*2), max_xy.y + y_len/2);
		min_lon =min_coord.lon%360; 
		max_lon =max_coord.lon%360;
		min_lat = (min_coord.lat < -85.051128514)? -85.051128514:min_coord.lat; 
		max_lat = (max_coord.lat > 85.051128514)? 85.051128514:max_coord.lat;
		min_lon =(x_len*2 >=h_base*2)?-180:min_lon;
		max_lon =(x_len*2 >=h_base*2)?180:max_lon;
	}
	
	var zone_tl = GEOHEX.getZoneByLocation(max_lat, min_lon, _level);
	var zone_bl = GEOHEX.getZoneByLocation(min_lat, min_lon, _level);
	var zone_br = GEOHEX.getZoneByLocation(min_lat, max_lon, _level);
	var zone_tr = GEOHEX.getZoneByLocation(max_lat, max_lon, _level);

	var start_x = zone_bl.x;
	var start_y = zone_bl.y;

	var h_size = zone_br.getHexSize();
	
	var bl_xy = GEOHEX.loc2xy(zone_bl.lon, zone_bl.lat);
	var bl_cl = GEOHEX.xy2loc(bl_xy.x - h_size, bl_xy.y).lon;
	var bl_cr = GEOHEX.xy2loc(bl_xy.x + h_size, bl_xy.y).lon;

	var br_xy = GEOHEX.loc2xy(zone_br.lon, zone_br.lat);
	var br_cl = GEOHEX.xy2loc(br_xy.x - h_size, br_xy.y).lon;
	var br_cr = GEOHEX.xy2loc(br_xy.x + h_size, br_xy.y).lon;

	var s_steps = getXSteps(min_lon, max_lon, zone_bl, zone_br);
	var w_steps = getYSteps(min_lon, zone_bl, zone_tl);
	var n_steps = getXSteps(min_lon, max_lon, zone_tl, zone_tr);
	var e_steps = getYSteps(max_lon, zone_br, zone_tr);
	

	// 矩形端にHEXの抜けを無くすためのエッジ処理
	var edge={l:0,r:0,t:0,b:0};
	
	if(s_steps == n_steps&& s_steps >= base_steps){
			edge.l = 0;
			edge.r = 0; 
	}else{
		if(min_lon>0&&zone_bl.lon==-180){
			var m_lon = min_lon - 360;
			if(bl_cr < m_lon) edge.l = 1;
			if(bl_cl > m_lon) edge.l = -1;
		}else{
			if(bl_cr < min_lon) edge.l = 1;
			if(bl_cl > min_lon) edge.l = -1;
		}
	
		if(max_lon>0&&zone_br.lon==-180){
			var m_lon = max_lon - 360;
			if(br_cr < m_lon) edge.r = 1;
			if(br_cl > m_lon) edge.r = -1;
		}else{
			if(br_cr < max_lon) edge.r = 1;
			if(br_cl > max_lon) edge.r = -1;
		}
	}
	
	if(zone_bl.lat > min_lat) edge.b++;
	if(zone_tl.lat > max_lat) edge.t++;	

	// 仮想HEX_XY座標系上の辺リスト（ S & W ）を取得
	var s_list = getXList(zone_bl, s_steps, edge.b);
	var w_list = getYList(zone_bl, w_steps, edge.l);
	
	// 仮想HEX_XY座標系上の矩形端（ NW & SE ）取得
	var tl_end = {"x": w_list[w_list.length-1].x, "y": w_list[w_list.length-1].y};
	var br_end = {"x": s_list[s_list.length-1].x, "y": s_list[s_list.length-1].y};
	
	// 仮想HEX_XY座標系上の辺リスト（ N & E ）取得
	var n_list = getXList(tl_end, n_steps, edge.t);
	var e_list = getYList(br_end, e_steps, edge.r);
	
	// S & W & N & E 辺リストに囲まれた内包HEXリストを取得
	var mrg_list = mergeList(s_list.concat(w_list, n_list, e_list), _level);

	return(mrg_list);
}


// longitude方向の仮想リスト取得
function getXList(_min, _xsteps, _edge){
	var list=[];
	for(var i=0;i<_xsteps;i++){
		var x = (_edge)? _min.x + Math.floor(i/2) : _min.x + Math.ceil(i/2);
		var y = (_edge)? _min.y + Math.floor(i/2) - i : _min.y + Math.ceil(i/2) - i;
		list.push({"x": x, "y":y});
	}
	return list;
}

// latitude方向の仮想リスト取得 （この時点では補正しない）
function getYList(_min, _ysteps, _edge){
	var list=[];
	var steps_base = Math.floor(_ysteps);
	var steps_half = _ysteps - steps_base;
	
	for(var i=0;i<steps_base;i++){
			var x = _min.x + i;
			var y = _min.y + i;
			list.push({"x": x, "y":y});
			
			if(_edge != 0){
				if((steps_half ==0)&&(i==steps_base-1)){
				}else{
					var x = (_edge>0)?_min.x+ i + 1:_min.x + i;
					var y = (_edge<0)?_min.y + i + 1:_min.y + i;
					list.push({"x": x, "y":y});
				}
			}
	}
	return list;
}

// longitude方向のステップ数取得
function getXSteps(_minlon, _maxlon, _min, _max){
		var minsteps = Math.abs(_min.x - _min.y);
		var maxsteps = Math.abs(_max.x - _max.y);
	 	var code = _min.code;
		var base_steps =  Math.pow(3, code.length)*2;
		
		var steps=0;

		if(_min.lon== -180&&_max.lon==-180){
			if((_minlon>_maxlon&&_minlon*_maxlon>=0)||(_minlon<0&&_maxlon>0)) steps = base_steps; else steps=0;
		}else if(Math.abs(_min.lon - _max.lon) < 0.0000000001){
			if(_min.lon!= -180&&_minlon>_maxlon){
				steps = base_steps;
			}else{
				steps = 0;
			}
				
		}else if(_min.lon < _max.lon){
			if(_min.lon<=0&&_max.lon<=0){
				steps = minsteps - maxsteps;
			}else if(_min.lon<=0&&_max.lon>=0){
				steps = minsteps + maxsteps;
			}else if(_min.lon>=0&&_max.lon>=0){
				steps = maxsteps - minsteps;
			}
		}else if(_min.lon > _max.lon){
			if(_min.lon<=0&&_max.lon<=0){
				steps = base_steps - maxsteps + minsteps;
			}else if(_min.lon>=0&&_max.lon<=0){
				steps = base_steps-(minsteps + maxsteps);
			}else if(_min.lon>=0&&_max.lon>=0){
				steps = base_steps + maxsteps - minsteps;
			}
		}
		return steps + 1;
}

// latitude方向のステップ数取得
function getYSteps(_lon, _min, _max){

	var steps;
	var min_x = _min.x;
	var min_y = _min.y;
	var max_x = _max.x;
	var max_y = _max.y;
			
	if(_lon>0){
		if(_min.lon !=-180&&_max.lon ==-180){
			max_x =_max.y;
			max_y =_max.x;
		}
		if(_min.lon ==-180&&_max.lon !=-180){
			min_x =_min.y;
			min_y =_min.x;
		}
	}
	var steps = Math.abs(min_y - max_y);
	var half = Math.abs(max_x - min_x) - Math.abs(max_y - min_y);
	return steps + half*0.5 + 1;
}

function mergeList(_arr, _level){
	var text ="";
	var newArr=[];
	var mrgArr= new Array();
	
	for (var i=0;i<_arr.length;i++) {
		text += (_arr[i].x + ' : ' + _arr[i].y + "\n");
	}
	
	var text ="";
	
	// HEX_Y座標系でソート
	_arr.sort(function(a, b) {
		return ( a.x > b.x ? 1 : a.x < b.x ? -1 : a.y < b.y ? 1 : -1 );
	});
	
  	// マージ＆補完
	for (var i=0;i<_arr.length;i++) {
		if(!i){
			// 仮想XY値が確定したこの時点でadjust補正
			var inner_xy = GEOHEX.adjustXY(_arr[i].x,_arr[i].y,_level);
			var x = inner_xy.x;
			var y = inner_xy.y;
			if(!mrgArr[x]) mrgArr[x] = new Array();
			if(!mrgArr[x][y]){
				mrgArr[x][y] = true;
				newArr.push({"x":x,"y":y}) 
			}
		}else{
			var mrg = margeCheck(_arr[i-1], _arr[i]);
			for(j=0; j<mrg ; j++){
				// 仮想XY値が確定したこの時点でadjust補正
				var inner_xy = GEOHEX.adjustXY(_arr[i].x,_arr[i].y+j,_level);
				var x = inner_xy.x;
				var y = inner_xy.y;
				if(!mrgArr[x]) mrgArr[x] = new Array();
				if(!mrgArr[x][y]){
					mrgArr[x][y] = true;
					newArr.push({"x":x,"y":y}) 
				}
			}
		}
	}
   return newArr;
}

function margeCheck(_pre, _next){
	if(_pre.x == _next.x){
		if(_pre.y == _next.y){
			return 0;
		}else{
			return Math.abs(_next.y -_pre.y);
		}
	}else{
		return 1;
	}
}


module.exports = getXYListByRect;