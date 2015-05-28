"use strict";
var _ = require("lodash");

module.exports = function (grunt) {
	var sourceFiles = [ "*.js", "src/**/*.js" ];
	var testFiles = [ "test/**/*.js" ];
	var allFiles = sourceFiles.concat(testFiles);

	var defaultJsHintOptions = grunt.file.readJSON("./.jshintrc");
	var testJsHintOptions = _.extend(
		grunt.file.readJSON("./.jshintrc.test"),
		defaultJsHintOptions
	);

	grunt.initConfig({
		jscs : {
			src     : allFiles,
			options : {
				config : "./.jscsrc",
				force  : true
			}
		},

		jshint : {
			src     : sourceFiles,
			options : defaultJsHintOptions,
			test    : {
				options : testJsHintOptions,
				files   : {
					test : testFiles
				}
			}
		},

		mochaIstanbul : {
			coverage : {
				src : "test/**/*.js"
			},
			options  : {
				coverage      : true,
				reporter      : "spec",
				reportFormats : [ "lcov", "text" ],
				print         : "detail"
			}
		}
	});

	grunt.registerTask("setupTestEnvironment", [], function () {
		function setDefaultEnvironmentVar (name, defaultValue) {
			process.env[ name ] = process.env[ name ] || defaultValue;
		}

		setDefaultEnvironmentVar("NODE_ENV", "test");
		setDefaultEnvironmentVar("HOST", "localhost");
		setDefaultEnvironmentVar("PORT", "8080");
		setDefaultEnvironmentVar("SESSION_SECRET", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
		setDefaultEnvironmentVar("CATAPULT_API_ENDPOINT", "http://catapult");
		setDefaultEnvironmentVar("CATAPULT_USER_ID", "userId");
		setDefaultEnvironmentVar("CATAPULT_TOKEN", "apiToken");
		setDefaultEnvironmentVar("CATAPULT_SECRET", "apiSecret");
		setDefaultEnvironmentVar("ACCESS_CODE", "pass");
		setDefaultEnvironmentVar("APP_URL", "http://localhost:8080/");
	});

	// Load plugins
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-jscs");
	grunt.loadNpmTasks("grunt-mocha-istanbul");

	// Rename tasks
	grunt.task.renameTask("mocha_istanbul", "mochaIstanbul");

	// Register tasks
	grunt.registerTask("lint", "Check for common code problems.", [ "jshint" ]);
	grunt.registerTask("style", "Check for style conformity.", [ "jscs" ]);
	grunt.registerTask("test", [ "lint", "style", "setupTestEnvironment", "mochaIstanbul" ]);
	grunt.registerTask("default", [ "lint", "style" ]);
};