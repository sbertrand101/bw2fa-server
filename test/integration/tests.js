"use strict";
var server = require("../../src/server");
var expect = require("chai").expect;
var nock = require("nock");
var Session = require("../../src/models/session");

describe("bw2fa-server root", function () {
	describe("get /", function () {
		var response = null;

		before(function (done) {
			server.inject({ method : "GET", url : "/" }, function (res) {
				response = res;
				done();
			});
		});

		after(function () {
			response = null;
		});

		it("should return a service description", function () {
			var expected = {
				name        : "bw2fa-server",
				description : "Bandwidth Two Factor Authentication Service"
			};
			expect(JSON.parse(response.payload)).to.deep.equal(expected);
		});

		it("should return with status code 200", function () {
			expect(response.statusCode).to.equal(200);
		});
	});
});

describe("bw2fa-server sessions", function () {
	var response = null;

	describe("create", function () {
		var injectPayload = {
			sendFrom : "+18001111111",
			sendTo   : "+19999999999"
		};

		var injectOptions = {
			url         : "/sessions",
			method      : "POST",
			payload     : injectPayload,
			credentials : {}
		};

		var bandwidthMessage = {
			id        : "xyz",
			messageId : "xyz",
			from      : "+18001111111",
			to        : "+19999999999",
			text      : "1243456",
			time      : "2012-10-05T20:37:38.048Z",
			direction : "out",
			state     : "sent"
		};

		after(function () {
			response = null;
		});

		describe("success", function () {
			before(function (done) {
				var location = {
					Location : "http://catapult/v1/users/userId/messages/xyz"
				};

				nock("http://catapult")
					.post("/v1/users/userId/messages")
					.reply(201, null, location);

				nock("http://catapult")
					.get("/v1/users/userId/messages/xyz")
					.reply(200, bandwidthMessage);

				server.inject(injectOptions, function (res) {
					response = res;
					done();
				});
			});

			after(function () {
				response = null;
			});

			it("should return a 201 status code", function () {
				expect(response.statusCode).to.equal(201);
			});

			it("should return an encrypted session", function () {
				var json = JSON.parse(response.payload);
				expect(json).to.have.property("session");
			});
		});

		describe("internal error", function () {
			before(function (done) {
				nock("http://catapult")
					.post("/v1/users/userId/messages")
					.reply(500, null);

				server.inject(injectOptions, function (res) {
					response = res;
					done();
				});
			});

			after(function () {
				response = null;
			});

			it("should return a 500 status code", function () {
				expect(response.statusCode).to.equal(500);
			});
		});

		describe("input error", function () {
			before(function (done) {
				var options = {
					url         : "/sessions",
					method      : "POST",
					payload     : {
						sendTo   : "+19999999999",
						sendFrom : false
					},
					credentials : {}
				};

				server.inject(options, function (res) {
					response = res;
					done();
				});
			});

			after(function () {
				response = null;
			});

			it("should return a 400 status code", function () {
				expect(response.statusCode).to.equal(400);
			});
		});

		describe("access code not provided", function () {
			before(function (done) {
				var options = {
					url     : "/sessions",
					method  : "POST",
					payload : {}
				};

				server.inject(options, function (res) {
					response = res;
					done();
				});
			});

			after(function () {
				response = null;
			});

			it("should return a 401 status code", function () {
				expect(response.statusCode).to.equal(401);
			});
		});
	});

	describe("get", function () {
		describe("expired session", function () {
			var session = new Session({ verify : "000000", expires : 1 });
			var encryptedSession = null;

			before(function (done) {
				session.toEncryptedString()
					.then(function (encrypted) {
						encryptedSession = encrypted;

						var url = "/sessions/" + encryptedSession +
							"?verify=" + session.verify;

						var injectOptions = {
							method      : "GET",
							url         : url,
							credentials : {}

						};

						server.inject(injectOptions, function (res) {
							response = res;
							done();
						});
					})
					.catch(function (error) {
						done(error);
					})
					.done();
			});

			after(function () {
				response = null;
			});

			it("should return an expired error message", function () {
				var json = JSON.parse(response.payload);
				expect(json).to.deep.equal({
					status  : 400,
					message : "session expired"
				});
			});

			it("should return with status code 400", function () {
				expect(response.statusCode).to.equal(400);
			});
		});

		describe("correct session verification code", function () {
			var session = new Session({
				verify  : "000000",
				expires : Number.MAX_VALUE
			});
			var encryptedSession = null;

			before(function (done) {
				session.toEncryptedString()
					.then(function (encrypted) {
						encryptedSession = encrypted;

						var url = "/sessions/" + encryptedSession +
							"?verify=" + session.verify;

						var injectOptions = {
							method      : "GET",
							url         : url,
							credentials : {}
						};

						server.inject(injectOptions, function (res) {
							response = res;
							done();
						});
					})
					.catch(function (error) {
						done(error);
					})
					.done();
			});

			after(function () {
				response = null;
			});

			it("should return with status code 200", function () {
				expect(response.statusCode).to.equal(200);
			});

			it("should return a status message", function () {
				var json = JSON.parse(response.payload);
				expect(json).to.deep.equal({ status : 200 });
			});
		});

		describe("incorrect session verification code", function () {
			var session = new Session({
				verify  : "000000",
				expires : Number.MAX_VALUE
			});
			var encryptedSession = null;

			before(function (done) {
				session.toEncryptedString()
					.then(function (encrypted) {
						encryptedSession = encrypted;

						var injectOptions = {
							method      : "GET",
							url         : "/sessions/" + encryptedSession + "?verify=999999",
							credentials : {}
						};

						server.inject(injectOptions, function (res) {
							response = res;
							done();
						});
					})
					.catch(function (error) {
						done(error);
					})
					.done();
			});

			after(function () {
				response = null;
			});

			it("should return with status code 400", function () {
				expect(response.statusCode).to.equal(400);
			});

			it("should return an invalid error message", function () {
				var json = JSON.parse(response.payload);
				expect(json).to.deep.equal({
					status  : 400,
					message : "invalid code"
				});
			});
		});

		describe("access code not provided", function () {
			var session = new Session({
				verify  : "000000",
				expires : Number.MAX_VALUE
			});
			var encryptedSession = null;

			before(function (done) {
				session.toEncryptedString()
					.then(function (encrypted) {
						encryptedSession = encrypted;

						var injectOptions = {
							method : "GET",
							url    : "/sessions/" + encryptedSession + "?verify=999999",
						};

						server.inject(injectOptions, function (res) {
							response = res;
							done();
						});
					})
					.catch(function (error) {
						done(error);
					})
					.done();
			});

			after(function () {
				response = null;
			});

			it("should return with status code 401", function () {
				expect(response.statusCode).to.equal(401);
			});
		});

		describe("incorrect access code provided", function () {
			var session = new Session({
				verify  : "000000",
				expires : Number.MAX_VALUE
			});
			var encryptedSession = null;

			before(function (done) {
				function basicHeader (username, password) {
					var creds = new Buffer(username + ":" + password, "utf8");
					return "Basic " + creds.toString("base64");
				}

				session.toEncryptedString()
					.then(function (encrypted) {
						encryptedSession = encrypted;

						var injectOptions = {
							method  : "GET",
							url     : "/sessions/" + encryptedSession + "?verify=999999",
							headers : {
								authorization : basicHeader("", "badpass")
							}
						};

						server.inject(injectOptions, function (res) {
							response = res;
							done();
						});
					})
					.catch(function (error) {
						done(error);
					})
					.done();
			});

			after(function () {
				response = null;
			});

			it("should return with status code 401", function () {
				expect(response.statusCode).to.equal(401);
			});
		});
	});
});
