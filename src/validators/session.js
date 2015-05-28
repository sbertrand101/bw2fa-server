"use strict";

var Joi = require("joi");
var Session = require("./../models/session");

function SessionValidator () {
}

SessionValidator.prototype.create = {
	payload : {
		sendFrom : Joi.string().required(),
		sendTo   : Joi.string().required()
	}
};

SessionValidator.prototype.get = {
	params : function (value, options, next) {
		Session.fromEncryptedString(value.session)
			.then(function (session) {
				next(null, { session : session });
			})
			.catch(function (error) {
				next(error, null);
			})
			.done();
	},
	query  : {
		verify : Joi.string().required()
	}
};

module.exports = new SessionValidator();