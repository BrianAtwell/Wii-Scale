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

(function() {
    'use strict';

    angular.module('app.services', []).
        
        factory('socket', ['socketFactory', function (socketFactory) {
            return socketFactory();
        }]).

        factory('socketCommands', function(){
            var commands = Object.freeze({
                CLIENT_LOAD:            	'client load',
				CLIENT_LIVE_LOAD:		'client live load',

                DEVICE_CONNECT:         	'device connect',
                DEVICE_DISCONNECT:      	'device disconnect',
				DEVICE_START_RAW_WEIGHT:	'device start raw weight',
				DEVICE_STOP_RAW_WEIGHT:		'device stop raw weight',

                SETTINGS_RECEIVE_VALS:  	'settings values',

                USERS_ADD:              	'users add',
                USERS_REMOVE:           	'users remove',
                USERS_RECEIVE_LIST:     	'users list',

                ENTRIES_ADD:            	'entries add',
                ENTRIES_REMOVE:         	'entries delete',
                ENTRIES_USER:           	'entries user',
                ENTRIES_RECEIVE_LIST:   	'entries list',
				
				LIVE_ENTRIES_ADD:			'live entries add',
				LIVE_ENTRIES_REMOVE:		'live entries remove',
				LIVE_ENTRIES_USER:			'live entries user',
				LIVE_ENTRIES_RECEIVE_LIST:	'live entries RECEIVE_LIST',

                WIISCALE_WEIGHT:        	'wiiscale-weight',
				WIISCALE_RAW_WEIGHT:		'wiiscale-raw-weight',
                WIISCALE_STATUS:        	'wiiscale-status',
				WIISCALE_RAW_WEIGHT_MODE:	'wiiscale-raw-weight-mode',
				WIISCALE_STANDARD_WEIGHT_MODE:	'wiiscale-standard-weight-mode',
				WIISCALE_SEND_CONNECT: 		'wiiscale-connect'
				
            });
            return commands;
        }).

        factory('client', ['$scope', 'socket', 'socketCommands', function ($scope, socket, socketCommands){
            var client = {
                load: load,
            };

            return client;

            function load() {
				socket.emit(socketCommands.CLIENT_LOAD);
				/*
				if(typeof $scope.mainview !== undefined && $scope.mainview == 'LiveController')
				{
					socket.emit(socketCommands.CLIENT_LIVE_LOAD);
				}
				else
				{
					socket.emit(socketCommands.CLIENT_LOAD);
				}
				*/
            }
        }]).

        factory('device', ['socket', 'socketCommands', function (socket, socketCommands){
            var device = {
                connect: connect,
                disconnect: disconnect,
            };

            return device;

            function connect() {
                socket.emit(socketCommands.DEVICE_CONNECT);
            }

            function disconnect() {
                socket.emit(socketCommands.DEVICE_DISCONNECT);
            }
        }]).

        factory('users', ['socket', 'socketCommands', function (socket, socketCommands){
            var users = {
                add: add,
                remove: remove,
            };

            return users;

            function remove(user) {
                socket.emit(socketCommands.USERS_REMOVE, user);
            }

            function add(user) {
                socket.emit(socketCommands.USERS_ADD, user);
            }

        }]).

        factory('entries', ['socket', 'socketCommands', function (socket, socketCommands){
            var entries = {
                add: add,
                remove: remove,
                getUserEntries: getUserEntries,
            };

            return entries;

            function add(user, weight) {
                socket.emit(socketCommands.ENTRIES_ADD, {userName: user.name, weight: weight});
            }

            function remove(entry) {
                socket.emit(socketCommands.ENTRIES_REMOVE, entry);
            }

            function getUserEntries(user) {
                socket.emit(socketCommands.ENTRIES_USER, user);
            }

        }]).
		
		factory('liveentries', ['socket', 'socketCommands', function (socket, socketCommands){
            var liveentries = {
                add: add,
                remove: remove,
                getUserEntries: getUserEntries,
            };

            return liveentries;

            function add(user, weight) {
                socket.emit(socketCommands.LIVE_ENTRIES_ADD, {userName: user.name, weight: weight});
            }

            function remove(entry) {
                socket.emit(socketCommands.LIVE_ENTRIES_REMOVE, entry);
            }

            function getUserEntries(user) {
                socket.emit(socketCommands.LIVE_ENTRIES_USER, user);
            }

        }]);

})();
