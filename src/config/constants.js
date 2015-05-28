"use strict";

var Joi = require("joi");

var DEFAULT_CATAPULT_ENDPOINT = "https://api.catapult.inetwork.com";
var DEFAULT_SESSION_TTL = 60;

var constants = {
	application : {
		url           : process.env.APP_URL || "http://localhost:8080",
		host          : process.env.HOST || "0.0.0.0",
		port          : parseInt(process.env.PORT) || 8080,
		sessionSecret : process.env.SESSION_SECRET,
		sessionTTL    : process.env.SESSION_TTL || DEFAULT_SESSION_TTL,
		accessCode    : process.env.ACCESS_CODE || "2fapass"
	},
	catapult    : {
		apiEndPoint : process.env.CATAPULT_API_ENDPOINT ||
		DEFAULT_CATAPULT_ENDPOINT,
		userId      : process.env.CATAPULT_USER_ID,
		token       : process.env.CATAPULT_TOKEN,
		secret      : process.env.CATAPULT_SECRET
	}
};

var constantsSchema = Joi.object().keys({
	application : Joi.object().keys({
		url           : Joi.string().required(),
		host          : Joi.string().required(),
		port          : Joi.number().required(),
		sessionTTL    : Joi.number().required(),
		accessCode    : Joi.string().required(),
		sessionSecret : Joi.string().min(32).required()
	}),
	catapult    : Joi.object().keys({
		apiEndPoint : Joi.string().required(),
		userId      : Joi.string().required(),
		token       : Joi.string().required(),
		secret      : Joi.string().required()
	})
});

Joi.validate(constants, constantsSchema, function (err, value) {
	if (err) {
		throw err;
	}
	module.exports = value;
});
