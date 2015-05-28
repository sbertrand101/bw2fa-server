"use strict";

var SessionController = require("./../controllers/session");
var SessionValidator = require("./../validators/session");

module.exports = [
	{
		method : "POST",
		path   : "/sessions",
		config : {
			handler  : SessionController.create,
			validate : SessionValidator.create,
			auth     : "simple"
		}
	},
	{
		method : "GET",
		path   : "/sessions/{session}",
		config : {
			handler  : SessionController.get,
			validate : SessionValidator.get,
			auth     : "simple"
		}
	}
];