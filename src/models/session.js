"use strict";

var application = require("../config/constants").application;
var Promise = require("bluebird");
var Joi = require("joi");
var validate = Promise.promisify(Joi.validate);
var Iron = require("iron");
var seal = Promise.promisify(Iron.seal);
var unseal = Promise.promisify(Iron.unseal);

function nowStamp () {
	return Math.floor(Date.now() / 1000);
}

function Session (opts) {
	opts = opts || {};
	this.expires = opts.expires || nowStamp() + application.sessionTTL;
	this.verify = opts.verify ||
		String(Math.floor(Math.random() * (999999 - 100000)) + 100000);
}
module.exports = Session;

Session.prototype.isExpired = function isExpired () {
	return nowStamp() > this.expires;
};

Session.prototype.toEncryptedString = function toEncryptedString () {
	return seal(this, application.sessionSecret, Iron.defaults);
};

Session.fromEncryptedString = function fromEncryptedString (encrypted) {
	var sessionSchema = Joi.object({
		expires : Joi.number().required(),
		verify  : Joi.string().min(6).max(6).required()
	});

	return unseal(encrypted, application.sessionSecret, Iron.defaults)
		.then(function (decrypted) {
			return validate(decrypted, sessionSchema);
		})
		.then(function (validated) {
			return new Session(validated);
		});
};