"use strict";

function RootController () {
}
RootController.prototype.root = function root (request, reply) {
	reply({
		name        : "bw2fa-server",
		description : "Bandwidth Two Factor Authentication Service"
	});
};
module.exports = new RootController();