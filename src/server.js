"use strict";

var Hapi = require("hapi");
var constants = require("./config/constants.js");

var server = new Hapi.Server();
server.connection({
	host : constants.application.host,
	port : constants.application.port
});

var goodOpts = {
	reporters : [ {
		reporter : require("good-console"),
		events   : { log : "*", request : "*", response : "*" }
	} ]
};

server.register([
	{
		register : require("good"),
		options  : goodOpts
	},
	{
		register : require("hapi-auth-basic"),
		options  : {}
	}
], function (err) {
	if (err) {
		console.error("Failed to load a plugin:", err);
	}

	server.auth.strategy("simple", "basic", {
		validateFunc       : function (username, password, callback) {
			if (password === constants.application.accessCode) {
				callback(null, true, {});
			}
			else {
				callback(null, false);
			}
		},
		allowEmptyUsername : true
	});

	server.route(require("./routes/root"));
	server.route(require("./routes/session"));
});

module.exports = server;
