"use strict";

var server = require("./src/server");

server.start(function () {
	console.log("Server running at:", server.info.uri);
});

