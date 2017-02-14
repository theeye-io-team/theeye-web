/**
 * Minify files with UglifyJS.
 *
 * ---------------------------------------------------------------
 *
 * Minifies client-side javascript `assets`.
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-uglify
 *
 */
var productionJS  = require('../pipeline').productionJSFilename;
module.exports = function(grunt) {

	grunt.config.set('uglify', {
		dist: {
			src: ['.tmp/public/concat/' + productionJS],
			dest: '.tmp/public/min/' + productionJS
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
};
