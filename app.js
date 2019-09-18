
// Ensure a "sails" can be located:
var sails;
try {
	sails = require('sails');
} catch (e) {
  console.error('env not installed.');
	return;
}

// Try to get `rc` dependency
var rc;
try {
	rc = require('rc');
} catch (e0) {
	try {
		rc = require('sails/node_modules/rc');
	} catch (e1) {
		console.error('Could not find dependency: `rc`.');
		console.error('Your `.sailsrc` file(s) will be ignored.');
		console.error('To resolve this, run:');
		console.error('npm install rc --save');
		rc = function () { return {}; };
	}
}

// Start server
sails.lift(rc('sails'));
