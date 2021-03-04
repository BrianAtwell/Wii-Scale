/*
 * This file is part of Wii-Scale
 * Copyright © 2021 Brian Atwell
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

var fs = require('fs')
var kill = require('tree-kill')


var getPIDNumberFromRegex = function(userText, userRegex)
{
	const matchResult = userText.match(userRegex);
	if (matchResult != undefined)
	{
			digitMatchResult=matchResult[0].match(/\d+/g);
			if(digitMatchResult != undefined)
			{
					pid=digitMatchResult[0]
					return pid
			}
	}

	return undefined;
}

const parentPIDRegex  = /(parentPID\:\ )(\d+)/g ;
const childPIDRegex = /(childPID\:\ )(\d+)/g ;

const serverPidText = fs.readFileSync('.server.pid', {
  encoding: 'utf8'
});

const parentPID = getPIDNumberFromRegex(serverPidText, parentPIDRegex);
const childPID = getPIDNumberFromRegex(serverPidText, childPIDRegex);

if(parentPID!= undefined)
{
	kill(parentPID);
}
/*
if(childPID!=undefined)
{
	kill(childPID);
}
*/

fs.unlinkSync('.server.pid')


console.log("Killed parentPID "+parentPID);
console.log("Killed childPID "+childPID);

