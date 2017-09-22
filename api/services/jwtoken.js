'use strict'

/**
 * jwToken
 *
 * @description :: JSON Webtoken Service for sails
 * @help        :: See https://github.com/auth0/node-jsonwebtoken & http://sailsjs.org/#!/documentation/concepts/Services
 */
 
const jwt = require('jsonwebtoken')
const config = sails.config.auth

// Generates a token from supplied payload
module.exports.issue = (payload) => {
	return jwt.sign(
		payload,
		config.secret, // our Private Key
		{
			expiresIn: config.expires
		}
	)
}

// Verifies token on a request
module.exports.verify = (token, callback) => {
	return jwt.verify(
		token,
		config.secret,
		{}, // for more option see https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
		callback
	)
}
