// GeoCracker v0.53beta
// Produced by Jeremy Reeder, CPS.
// Copyright (C) 2007 The Safe House. All rights reserved.

//defaults
var angular_units = 100;
var length_units = 'in';

//relative unit lengths
var unit_lengths = new Array();
unit_lengths['in'] = 25.4;
unit_lengths['mm'] = 1;

function polarToCartesian(point_id) {
	//get values
		var point_t = parseFloat(document.getElementById(point_id + '_t').value);
		var point_r = parseFloat(document.getElementById(point_id + '_r').value);
	//translate angular units
		point_t = point_t * (2 * Math.PI) / angular_units;
	//convert to cartesian
		var x = point_r * Math.cos(point_t);
		var y = point_r * Math.sin(point_t);
	//swap axes to match geometric standard
		var point_x = y;
		var point_y = x;
	//store values
		document.getElementById(point_id + '_x').value = point_x;
		document.getElementById(point_id + '_y').value = point_y;
	//validate values
		validateLength(point_id + '_x');
		validateLength(point_id + '_y');
}

function cartesianToPolar(point_id) {
	//get values
		var point_x = parseFloat(document.getElementById(point_id + '_x').value);
		var point_y = parseFloat(document.getElementById(point_id + '_y').value);
	//initialize variables
		var point_t, point_r;
	//avoid division by zero
		if (!point_x) {
			if (point_y < 0) {
				point_t = angular_units / 2;
			} else {
				point_t = 0;
			}
			point_r = Math.abs(point_y);
		} else {
			//swap axes to match safecrackers' standard
			var x = point_y;
			var y = point_x;
			//convert to polar
			point_t = Math.atan(y / x);
			point_r = y / Math.sin(point_t);
			//translate angular units
			point_t = point_t * angular_units / (2 * Math.PI);
			//convert negative radius
			if (point_r < 0) {
				point_r = Math.abs(point_r);
				point_t += angular_units / 2;
			}
			//fit theta to range: 0 <= theta < angular_units
			point_t = (point_t + angular_units) % angular_units;
		}
	//store values
		document.getElementById(point_id + '_t').value = point_t;
		document.getElementById(point_id + '_r').value = point_r;
	//validate values
		validateAngle(point_id + '_t');
		validateLength(point_id + '_r');
}

function validateLength(length_id) {
	var length_precision = new Array();
	length_precision['in'] = 200; //0.005in
	length_precision['mm'] = 10; //0.1mm
	//get value
		var length_value = parseFloat(document.getElementById(length_id).value);
	//parse value
		if (!length_value) //force numeric value
			length_value = 0;
		else if ((length_value < Math.floor(length_value) + 1 / length_precision[length_units]) //if close to integer
			 || (length_value > Math.ceil(length_value) - 1 / length_precision[length_units]))
				length_value = Math.round(length_value); //round to integer
		else
			length_value = //limit decimals according to unit precision
			 Math.round(length_value * length_precision[length_units]) / length_precision[length_units];
	//store value
		document.getElementById(length_id).value = length_value;
}

function validateAngle(angle_id) {
	//get value
		var angle_value = parseFloat(document.getElementById(angle_id).value);
	//parse value
		if (!angle_value)
			angle_value = 0;
		else {
			//fit to range: 0 <= angle_value < angular_units
				angle_value = (angle_value + angular_units) % angular_units;
			//round value
				angle_value = Math.round(angle_value * 10) / 10; //limit to tenths
		}
	//store value
		document.getElementById(angle_id).value = angle_value;
}

function addVectors() {
	//cartesian coordinates
		//validate cartesian coordiates for p1 & p2
			for (var i=1; i<=2; i++) {
				validateLength('p' + i + '_x');
				validateLength('p' + i + '_y');
			}
		//get values
			var x = new Array();
			x[1] = parseFloat(document.getElementById('p1_x').value);
			x[2] = parseFloat(document.getElementById('p2_x').value);
			var y = new Array();
			y[1] = parseFloat(document.getElementById('p1_y').value);
			y[2] = parseFloat(document.getElementById('p2_y').value);
		//calculate values
			x[3] = x[1] + x[2];
			y[3] = y[1] + y[2];
		//store values
			document.getElementById('p3_x').value = x[3];
			document.getElementById('p3_y').value = y[3];
		//validate cartesian coordinates for p3
			validateLength('p3_x');
			validateLength('p3_y');
	//set polar coordinates & position objects
		var object_id;
		for (i=1; i<=3; i++) {
			object_id = 'p' + i;
			cartesianToPolar(object_id);
			positionObject(object_id);
		}
	//set HUD range
		//get point widths & convert units from inches to the user's length units
			var dial_width = convertUnits(3.25, 'in');
			var p1_width = convertUnits(1.9, 'in');
			var p2_width = convertUnits(0.5, 'in');
			var p3_width = convertUnits(0.46, 'in');
		//calculate minimum & maximum cartesian coordinates needed
			var x_max = Math.max(0+dial_width/2, Math.max(x[1]+p1_width/2, Math.max(x[3]+Math.max(p2_width, p3_width)/2)));
			var x_min = Math.min(0-dial_width/2, Math.min(x[1]-p1_width/2, Math.min(x[3]-Math.max(p2_width, p3_width)/2)));
			var y_max = Math.max(0+dial_width/2, Math.max(y[1]+p1_width/2, Math.max(y[3]+Math.max(p2_width, p3_width)/2)));
			var y_min = Math.min(0-dial_width/2, Math.min(y[1]-p1_width/2, Math.min(y[3]-Math.max(p2_width, p3_width)/2)));
		//calculate width & height
			//calculate range used
				//alert('x_max = ' + x_max + '\nx_min = ' + x_min + '\ny_max = ' + y_max + '\ny_min = ' + y_min);
				var hud_width = x_max - x_min;
				var hud_height = y_max - y_min;
			//calculate dial center
				var dc_x = (hud_width - (x_min + x_max)) / 2;
				var dc_y = (hud_height + (y_min + y_max)) / 2;
			//pad edges by 0.25", but use the user's length units
				hud_width += convertUnits(0.5, 'in');
				hud_height += convertUnits(0.5, 'in');
				dc_x += convertUnits(0.25, 'in');
				dc_y += convertUnits(0.25, 'in');
		//specify units
			hud_width += length_units;
			hud_height += length_units;
			dc_x += length_units;
			dc_y += length_units;
		//store properties
			//alert('hud_width = ' + hud_width + '\nhud_height = ' + hud_height + '\ndc_x = ' + dc_x + '\ndc_y = ' + dc_y);
			document.getElementById('hud').style.width = hud_width;
			document.getElementById('hud').style.height = hud_height;
			document.getElementById('dial_center').style.left = dc_x;
			document.getElementById('dial_center').style.top = dc_y;
}

function convertUnits(length_value, old_units) {
	return length_value * unit_lengths[old_units] / unit_lengths[length_units];
}

function positionObject(object_id) {
	//get values
		var point_x = parseFloat(document.getElementById(object_id + '_x').value);
		var point_y = parseFloat(document.getElementById(object_id + '_y').value);
	//convert coordinates from Cartesian to CSS
		x = point_x;
		y = -point_y;
	//specify units
		x += length_units;
		y += length_units;
	//position object center
		document.getElementById(object_id).style.left = x;
		document.getElementById(object_id).style.top = y;
}

function polarCoordIsComplete(t_id) { //preserve theta until a non-zero radius is entered
	//generate radius id
		var the_underscore = t_id.indexOf('_');
		var r_id = t_id.substr(0, the_underscore) + '_r';
	//get radius value
		var r = parseFloat(document.getElementById(r_id).value);
	//true if radius is not zero
		return r;
}

function setAngularUnits(new_units) {
	angular_units = parseInt(new_units);
	addVectors(); //recalculate based on cartesian coordinates of p1 & p2
	return angular_units; //return parsed value
}

function setLengthUnits(new_units) {
	var old_units = length_units;
	length_units = new_units;
	
	for (var i=1; i<=2; i++) { //convert cartesian lengths for p1 & p2
		//get values
			x = document.getElementById('p' + i + '_x').value;
			y = document.getElementById('p' + i + '_y').value;
		//convert values
			x = x * unit_lengths[old_units] / unit_lengths[new_units];
			y = y * unit_lengths[old_units] / unit_lengths[new_units];
		//store values
			document.getElementById('p' + i + '_x').value = x;
			document.getElementById('p' + i + '_y').value = y;
		//validate values
			validateLength('p' + i + '_x');
			validateLength('p' + i + '_y');
	}
	addVectors(); //recalculate based on cartesian coordinates of p1 & p2
}