/*
	Author: Andreas Älveborn
	URL: https://github.com/aelveborn/Wii-Scale

	This file is part of Wii-Scale
	Copyright (C) 2015 Andreas Älveborn

	This program is free software; you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation; either version 2 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License along
	with this program; if not, write to the Free Software Foundation, Inc.,
	51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

var loki = require('lokijs'),
	db = new loki('app-data.json');

var LiveEntries = function(collection) {
	this.liveentries = collection;
};

LiveEntries.prototype.add = function(entry) {
	this.liveentries.insert(entry);
};

LiveEntries.prototype.clamp = function() {
	//Sort live entries by date descending
	// remove results greater than maxLength
	
	maxLength=100;
	
	userMaxLength=process.env.npm_package_config_max_live_entries;
	if(typeof userMaxLength !== undefined)
	{
		maxLength=userMaxLength;
	}
	
	resultset=this.liveentries.chain();
	length=resultset.data().length;
	
	if(length > maxLength)
	{
		resultset=resultset.simplesort("dateTime", false);
		resultset=resultset.limit(length-maxLength);
		dataArray=resultset.data();
		liveentries.remove(dataArray);
	}
};

LiveEntries.prototype.get = function() {
	return this.liveentries.data;
};

LiveEntries.prototype.remove = function(entry) {
	this.liveentries.remove(entry);
};

LiveEntries.prototype.getUserEntries = function(user) {
	return this.liveentries.find({
		userName: { '$eq': user.name }
	});
};

LiveEntries.prototype.removeUserEntries = function(user) {
	this.liveentries.removeWhere({
		userName: { '$eq': user.name }
	});
};

module.exports = LiveEntries;