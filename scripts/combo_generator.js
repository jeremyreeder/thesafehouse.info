// ComboGenerator v1.51
// Produced by Jeremy Reeder, CPS.
// Copyright (C) 2004-2007 The Safe House. All rights reserved.

// Initiate statistical counters.
var combos = 0;
var rejected_combos = 0;

function initForm(lock_form) {
	fenceChange(lock_form.fence);
	contactAreaChange(lock_form.contact_area);
	// Reset rejection rate counters.
	combos = 0;
	rejected_combos = 0;
}

function combinate(lock) {
	// Get lock construction.
	var fence_type = lock.fence.options[lock.fence.selectedIndex].value;
	var num_wheels = parseInt(lock.wheels.value);
	var lock_hand = lock.hand.options[lock.hand.selectedIndex].value;
	// Get contact area.
	var left_contact = parseInt(lock.left_contact.value);
	var right_contact = parseInt(lock.right_contact.value);
	// Get dial features.
	var dial_min = parseInt(lock.dial_min.value);
	var dial_max = parseInt(lock.dial_max.value);
	// Get safety parameters.
	var contact_safety = parseInt(lock.contact_safety.value);
	var fly_safety = parseInt(lock.fly_safety.value);
	// Calculate dial graduations.
	var dial_graduations = dial_max - dial_min + 1;

	var combinated = false;
	while (!combinated) {
		// Initialize combination variables.
		var combination_component = '';
		var direction = '';
		var wheels = new Array();
		var wheel_min = dial_min;
		var wheel_max = dial_max;

		// Set direction to retract lock bolt.
		if (fence_type == 'friction' || fence_type == 'direct entry')
			direction = 'L';
		else
			direction = lock_hand.substring(0,1);
		var combination = direction;
		
		// Set range of last wheel to avoid forbidden zone, if applicable.
		if (lock.contact_area.checked && (fence_type != 'direct entry')) {
			wheel_min = (right_contact + contact_safety - dial_min) % dial_graduations + dial_min;
			wheel_max = (left_contact + dial_graduations - contact_safety - dial_min) % dial_graduations + dial_min;
		}
		// Combinate lock.
		wheel_num = num_wheels;
		while (wheel_num > 0) {
			// Combinate wheel.
			wheels[wheel_num] =
			 Math.floor(Math.random() * ((wheel_max - wheel_min + dial_graduations) % dial_graduations)
			  + wheel_min) % dial_graduations;
			// Add wheel setting to combination.
			combination_component =
			 (num_wheels - wheel_num + 2 - (fence_type == 'direct entry'))
			 + 'x' + (direction = reverseDirection(direction)) + ':' + wheels[wheel_num];
			combination = combination_component + ', ' + combination;
			// Set range for adjacent wheel.
			wheel_min = (wheels[wheel_num] + fly_safety - dial_min) % dial_graduations + dial_min;
			wheel_max = (wheel_min + dial_graduations - 2 * fly_safety - dial_min) % dial_graduations + dial_min;
			// Decrement wheel counter.
			wheel_num--;
		}
		if (!(combinated = combinationIsValid(wheels))) { // Set variable.
			rejected_combos++; // Increment rejection counter.
			document.getElementById('bad_combo').value = combination;
			document.getElementById('bad_combo').style.display = 'inline';
		}
		document.getElementById('rejection_rate').value =
		 rejected_combos + '/' + (++combos) + ' (' + Math.round(rejected_combos / combos * 1000) / 10 + '%)';
	}
	if (fence_type == 'direct entry')
		combination = combination.substring(0, combination.length - 3); // Remove bolt retraction step.
	document.getElementById('statistics').style.display = 'block'; // Make statistics visible.
	return combination;
}

function reverseDirection(direction) {
	switch (direction) {
		case 'R':
			return 'L';
		default:
			return 'R';
	}
}

function fenceChange(fence) {
	var fence_type = fence.options[fence.selectedIndex].value;
	if ((fence_type == 'friction') || (fence_type == 'direct entry')) 
		document.getElementById('hand').style.display = 'none';
	else
		document.getElementById('hand').style.display = 'list-item';
	if (fence_type == 'direct entry')
		document.getElementById('contact_section').style.display = 'none';
	else
		document.getElementById('contact_section').style.display = 'list-item';
	return true;
}

function contactAreaChange(contact_area) {
	if (contact_area.checked)
		document.getElementById('contact_specs').style.display = 'block';
	else
		document.getElementById('contact_specs').style.display = 'none';
	return true;
}

function dialChange(min, max) {
	// Validate range.
	min.value = Math.max(min.value, 0);
	max.value = Math.max(max.value, parseInt(min.value) + 2);
	// Calculate graduations.
	var default_graduations = 100;
	// Start with default safety parameters for 100# dial.
	var default_left_contact = 5;
	var default_right_contact = 15;
	var default_contact_safety = 6;
	var default_fly_safety = 10;
	var graduations = max.value - min.value + 1;
	// Set new default safety parameters.
	document.getElementById('left_contact').value =
	 Math.round(default_left_contact * graduations / default_graduations);
	document.getElementById('right_contact').value =
	 Math.round(default_right_contact * graduations / default_graduations);
	document.getElementById('contact_safety').value =
	 Math.ceil(default_contact_safety * graduations / default_graduations);
	document.getElementById('fly_safety').value =
	 Math.ceil(default_fly_safety * graduations / default_graduations);
	return true;
}

function combinationIsValid(wheels) {
	var dial_min = parseInt(document.getElementById('dial_min').value);
	var dial_max = parseInt(document.getElementById('dial_max').value);
	var graduations = dial_max - dial_min + 1;
	var num_wheels = wheels.length - 1;
	var lame_simple = true; // guilty until proven innocent
	var lame_patterns = new Array( // factor, max multiplier
		new Array(5, 19), new Array(11, 9), new Array(12, 4), new Array(13, 3),
		new Array(23, 3), new Array(31, 3), new Array(32, 3));

	for (var wheel_num=2; wheel_num <= num_wheels; wheel_num++) {
		if (wheels[wheel_num] % 10 != wheels[1] % 10) // simple lame pattern
			lame_simple = false;
	}
	if (lame_simple)
		return false;
	if ((graduations + dial_min > 60) && (matchesDatePattern(wheels)))
		return false; // check for date only if dial has a spare month	
	for (var pattern_num=0; pattern_num < Math.min(lame_patterns.length, Math.floor(100*lame_patterns.length/graduations)); pattern_num++) {
		if (matchesComplexPattern(wheels, lame_patterns[pattern_num]))
			return false;
	}
	return true;
}

function matchesComplexPattern(wheels, pattern) {
	var num_wheels = wheels.length - 1;
	var dial_min = parseInt(document.getElementById('dial_min').value);
	var dial_max = parseInt(document.getElementById('dial_max').value);
	var graduations = dial_max - dial_min;
	var offset_match = new Array();
	for (var pattern_offset=0;
	 pattern_offset < dial_max;
	 pattern_offset += 10) {
	 	offset_match[pattern_offset] = 0;
		for (wheel_num=1; wheel_num <= num_wheels; wheel_num++) {
			if (!((wheels[wheel_num] - pattern_offset) % pattern[0]))
				offset_match[pattern_offset] += 1;
		}
		if (offset_match[pattern_offset] == num_wheels)
			return true;
	}
	return false;
}

function matchesDatePattern(wheels) {
	var the_language = 'en-us';
	var date_range_max = new Array();
	if (navigator.language)
		the_language = navigator.language;
	if (navigator.systemLanguage)
		the_language = navigator.systemLanguage;
	if (the_language.toLowerCase() == 'en-us') {
		month_wheel = 1; // mm/dd/yy
		day_wheel = 2;
	} else {
		day_wheel = 1; // dd/mm/yy
		month_wheel = 2;
	}
	if ((wheels[month_wheel] > 0) && (wheels[month_wheel] < 12)
	 && (wheels[day_wheel] > 0) && (wheels[day_wheel] < 31))
		return true;
	else
		return false;
}