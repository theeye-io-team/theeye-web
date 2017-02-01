/**
 * Compress CSS files.
 *
 * ---------------------------------------------------------------
 *
 * Minifies css files and places them into .tmp/public/min directory.
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-cssmin
 */
var productionCSS  = require('../pipeline').productionCSSFilename;
module.exports = function(grunt) {

	grunt.config.set('cssmin', {
		dist: {
			src: ['.tmp/public/concat/' + productionCSS],
			dest: '.tmp/public/min/' + productionCSS
		}
	});

	grunt.loadNpmTasks('grunt-contrib-cssmin');
};
