
process.env.INSTANCE_FQDN||(process.env.INSTANCE_FQDN=require('os').hostname());

process.env.SOCKET_AUTH_URL||(process.env.SOCKET_AUTH_URL = 'http://' + process.env.INSTANCE_FQDN);

console.log('socket connection url is set to : %s', process.env.SOCKET_AUTH_URL);

if( ! process.env.PORT )
{
    console.error('ERROR : PORT environment variable definition is required');
    console.error('ERROR : Define it in run.sh and run.debug.sh, via shell');
    console.error('ERROR : The Eye Web is not initialized.');
    return;
}

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
