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

var Entry = require('../models/entry.js');
var Entries = require('../models/entries.js');
var LiveEntry = require('../models/liveentry.js');
var LiveEntries = require('../models/liveentries.js');
var User = require('../models/user.js');
var Users = require('../models/users.js');

var users = null;
var entries = null;
var liveentries = null;
var NO_PREVIOUS_STATUS = "NO PREVIOUS STATUS";


// Database

var loki = require('lokijs'),
	db = new loki('app-data.json', {
		autoload: true,
		autoloadCallback: loadHandler
	});

function loadUsers () {
	var userColl = db.getCollection('users');
	if(userColl === null) {
		userColl = db.addCollection('users');
	}
	users = new Users(userColl);
}

function loadEntries () {
	var entriesColl = db.getCollection('entries');
	if(entriesColl === null) {
		entriesColl = db.addCollection('entries');
	}
	entries = new Entries(entriesColl);
}

function loadLiveEntries () {
	var liveEntriesColl = db.getCollection('liveentries');
	if(liveEntriesColl === null) {
		liveEntriesColl = db.addCollection('liveentries');
	}
	liveentries = new LiveEntries(liveEntriesColl);
}

function loadHandler () {
	// Users
	loadUsers();

	// Entries
	loadEntries();
	
	// LiveEntries
	loadLiveEntries();
}


module.exports = function(io) {

	var cmd = Object.freeze({
		SOCKET_CONNECT: 			'connect',
		SOCKET_DISCONNECT: 			'disconnect',

        DEVICE_RCV_CONNECT:         'device connect',
        DEVICE_RCV_DISCONNECT:      'device disconnect',
		DEVICE_RCV_START_RAW_WEIGHT: 'device start raw weight',
		DEVICE_RCV_STOP_RAW_WEIGHT:	'device stop raw weight',

        CLIENT_RCV_LOAD:  			'client load',
		CLIENT_LIVE_RCV_LOAD:		'client live load',

        SETTINGS_SEND_VALUES:       'settings values',

        USERS_RCV_ADD:              'users add',
        USERS_RCV_REMOVE:           'users remove',
        USERS_SEND_LIST:     		'users list',

        ENTRIES_RCV_ADD:            'entries add',
        ENTRIES_RCV_REMOVE:         'entries delete',
        ENTRIES_RCV_USER:           'entries user',
        ENTRIES_SEND_LIST:   		'entries list',
		
		LIVE_ENTRIES_ADD:			'live entries add',
		LIVE_ENTRIES_REMOVE:		'live entries remove',
		LIVE_ENTRIES_USER:			'live entries user',
		LIVE_ENTRIES_SEND_LIST:		'live entries RECEIVE_LIST',

        WIISCALE_WEIGHT:        	'wiiscale-weight',
		WIISCALE_RAW_WEIGHT:		'wiiscale-raw-weight',
        WIISCALE_STATUS:        	'wiiscale-status',
		WIISCALE_RAW_WEIGHT_MODE:	'wiiscale-raw-weight-mode',
		WIISCALE_STANDARD_WEIGHT_MODE:	'wiiscale-standard-weight-mode',
        WIISCALE_SEND_CONNECT: 		'wiiscale-connect',
        WIISCALE_SEND_DISCONNECT: 	'wiiscale-disconnect'
    });

	var connectedUsers = -1; // Start at negative one since wii-scale becomes a user
	var lastCommand = { status: NO_PREVIOUS_STATUS };

	io.on(cmd.SOCKET_CONNECT, function(socket) {

		// Server
		// -----------------------------------

		connectedUsers++;
		
		// Disconnect wii-scale if no users is on the site
		socket.on(cmd.SOCKET_DISCONNECT, function() {
			connectedUsers--;
			if(connectedUsers === 0) {
				lastCommand.status = NO_PREVIOUS_STATUS;
				io.emit(cmd.WIISCALE_SEND_DISCONNECT);
			}
		});


		// From Client
		// -----------------------------------

		// Send initial data to client
		socket.on(cmd.CLIENT_RCV_LOAD, function () {
			// Send current settings to the user
			socket.emit(cmd.SETTINGS_SEND_VALUES, {
				units: process.env.npm_package_config_units,
			});

			// Send all saved entries to the user
			socket.emit(cmd.USERS_SEND_LIST, users.get());

			// Send current status to new users
			socket.emit(cmd.WIISCALE_STATUS, lastCommand);
			
			//socket.emit(cmd.WIISCALE_STANDARD_WEIGHT_MODE);
		});
		
		/*
		// Send initial data to Live client
		socket.on(cmd.CLIENT_LIVE_RCV_LOAD, function () {
			// Send current settings to the user
			socket.emit(cmd.SETTINGS_SEND_VALUES, {
				units: process.env.npm_package_config_units,
			});

			// Send all saved entries to the user
			socket.emit(cmd.USERS_SEND_LIST, users.get());

			// Send current status to new users
			socket.emit(cmd.WIISCALE_STATUS, lastCommand);
			
			//socket.emit(cmd.WIISCALE_RAW_WEIGHT_MODE);
		});
		*/
		
		/*
		// Send initial data to client
		socket.on(cmd.CLIENT_RCV_LOAD, function () {
			// Send current settings to the user
			socket.emit(cmd.SETTINGS_SEND_VALUES, {
				units: process.env.npm_package_config_units,
			});

			// Send all saved entries to the user
			socket.emit(cmd.USERS_SEND_LIST, users.get());

			// Send current status to new users
			socket.emit(cmd.WIISCALE_STATUS, lastCommand);
		});
		*/

		// Connecto to hardware
		socket.on(cmd.DEVICE_RCV_CONNECT, function() {
			io.emit(cmd.WIISCALE_SEND_CONNECT);
		});

		// Disconnect device harware
		socket.on(cmd.DEVICE_RCV_DISCONNECT, function() {
			io.emit(cmd.WIISCALE_SEND_DISCONNECT);
		});
		
		/*
		// Start raw weigh device harware
		socket.on(cmd.DEVICE_RCV_START_RAW_WEIGHT, function() {
			io.emit(cmd.WIISCALE_RAW_WEIGHT_MODE);
		});
		
		// Stop raw weigh device harware
		socket.on(cmd.DEVICE_RCV_STOP_RAW_WEIGHT, function() {
			io.emit(cmd.WIISCALE_STANDARD_WEIGHT_MODE);
		});
		*/

		// Save a new entry for user
		// params.userName 	string
		// params.weight 	int
		socket.on(cmd.ENTRIES_RCV_ADD, function(params) {
			var item = new Entry(params.userName, params.weight);
			entries.add(item);
			db.saveDatabase();

			var user = new User(params.userName);
			socket.emit(cmd.ENTRIES_SEND_LIST, entries.getUserEntries(user));
		});

		// Remove entry
		// entry 			entry
		socket.on(cmd.ENTRIES_RCV_REMOVE, function(entry) {
			entries.remove(entry);
			db.saveDatabase();

			var user = new User(entry.userName);
			socket.emit(cmd.ENTRIES_SEND_LIST, entries.getUserEntries(user));
		});

		// Requests all entries for the user
		// params.name 		string
		socket.on(cmd.ENTRIES_RCV_USER, function(params) {
			var user = new User(params.name);
			socket.emit(cmd.ENTRIES_SEND_LIST, entries.getUserEntries(user));
		});
		
		// Save a new entry for user
		// params.userName 	string
		// params.weight 	int
		socket.on(cmd.LIVE_ENTRIES_RCV_ADD, function(params) {
			var item = new Entry(params.userName, params.weight);
			liveentries.add(item);
			//liveentries.clamp();
			db.saveDatabase();

			var user = new User(params.userName);
			socket.emit(cmd.LIVE_ENTRIES_SEND_LIST, liveentries.getUserEntries(user));
		});

		// Remove entry
		// entry 			entry
		socket.on(cmd.LIVE_ENTRIES_RCV_REMOVE, function(entry) {
			liveentries.remove(entry);
			db.saveDatabase();

			var user = new User(entry.userName);
			socket.emit(cmd.LIVE_ENTRIES_SEND_LIST, entries.getUserEntries(user));
		});

		// Requests all entries for the user
		// params.name 		string
		socket.on(cmd.LIVE_ENTRIES_RCV_USER, function(params) {
			var user = new User(params.name);
			socket.emit(cmd.LIVE_ENTRIES_SEND_LIST, liveentries.getUserEntries(user));
		});

		// Save new user
		// params.name 		string
		socket.on(cmd.USERS_RCV_ADD, function(params) {
			if(users.findUserByName(params.name) === null) {
				users.add(new User(params.name));
				db.saveDatabase();
				socket.emit(cmd.USERS_SEND_LIST, users.get());
			} else {
				// TODO: "User already exist"
			}
		});

		// Remove user
		// params.name 		string
		socket.on(cmd.USERS_RCV_REMOVE, function(params) {
			var user = users.findUserByName(params.name);
			if(user !== null) {
				users.remove(user);
				db.saveDatabase();
				socket.emit(cmd.USERS_SEND_LIST, users.get());
			} else {
				// TODO: "Could not find user"
			}			
		});


		// From Wii-Scale
		// -----------------------------------
		
		// Measured raw weight from wii-scale
		// data.totalWeight 	int
		socket.on(cmd.WIISCALE_RAW_WEIGHT, function(data){
			io.emit(cmd.WIISCALE_RAW_WEIGHT, data);
		});

		// Status from wii-scale
		// data.status 			string
		socket.on(cmd.WIISCALE_STATUS, function(data){
			io.emit(cmd.WIISCALE_STATUS, data);
			latestStatus = data;
		});

		// Measured weight from wii-scale
		// data.totalWeight 	int
		socket.on(cmd.WIISCALE_WEIGHT, function(data){
			io.emit(cmd.WIISCALE_WEIGHT, data);
		});
	});

};
