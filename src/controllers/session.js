"use strict";

var Promise = require("bluebird");
var constants = require("./../config/constants");
var Session = require("./../models/session");
var resolve = require("url").resolve;
var bandwidth = require("node-bandwidth");
var sendSMS = Promise.promisify(bandwidth.Message.create);

bandwidth.Client.globalOptions.apiToken = constants.catapult.token;
bandwidth.Client.globalOptions.apiSecret = constants.catapult.secret;
bandwidth.Client.globalOptions.userId = constants.catapult.userId;
bandwidth.Client.globalOptions.apiEndPoint = constants.catapult.apiEndPoint;

function SessionController () {
}

SessionController.prototype.create = function create (req, reply) {
	var session = new Session();
	var message = {
		from : req.payload.sendFrom,
		to   : req.payload.sendTo,
		text : session.verify
	};

	sendSMS(message)
		.then(function () {
			return session.toEncryptedString();
		})
		.then(function (encrypted) {
			var location = resolve(
				constants.application.url,
				"/sessions/" + encrypted);

			reply({ session : encrypted })
				.header("Location", location)
				.code(201);
		})
		.catch(function (error) {
			reply(error);
		})
		.done();
};

SessionController.prototype.get = function get (req, reply) {
	if (req.params.session.isExpired()) {
		reply({ status : 400, message : "session expired" }).code(400);
	}
	else if (req.params.session.verify === req.query.verify) {
		reply({ status : 200 }).code(200);
	}
	else {
		reply({ status : 400, message : "invalid code" }).code(400);
	}
};

module.exports = new SessionController();