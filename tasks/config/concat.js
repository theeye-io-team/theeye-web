/**
 * Concatenate files.
 *
 * ---------------------------------------------------------------
 *
 * Concatenates files javascript and css from a defined array. Creates concatenated files in
 * .tmp/public/contact directory
 * [concat](https://github.com/gruntjs/grunt-contrib-concat)
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-concat
 */
var productionJS  = require('../pipeline').productionJSFilename;
var productionCSS  = require('../pipeline').productionCSSFilename;
module.exports = function(grunt) {

  var hash = Date.now();

	grunt.config.set('concat', {
		js: {
			src: require('../pipeline').jsFilesToInject,
			dest: '.tmp/public/concat/' + productionJS
		},
		css: {
			src: require('../pipeline').cssFilesToInject,
			dest: '.tmp/public/concat/' + productionCSS
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
};
