"use strict";

var rootController = require("./../controllers/root");

module.exports = [
	{
		method : "GET",
		path   : "/",
		config : {
			handler : rootController.root
		}
	}
];