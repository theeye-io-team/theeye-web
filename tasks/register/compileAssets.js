module.exports = function (grunt) {
  grunt.registerTask('compileAssets', [
    'clean:dev',
    'handlebars:dev',       // changed jst task to handlebars task
    // 'less:dev',
    'copy:dev',
    // 'coffee:dev'
  ]);
};
