var request = require('request');
var debug = require('debug')('eye:web:services:snshandler');

module.exports = {
  handleSubscription : function handleSubscription(data, next)
  {
    var error = null;
    var success = null;

    if( typeof data != 'undefined' )
    {
      if( data.Type && data.Type == 'SubscriptionConfirmation' )
      {
        request(data.SubscribeURL, function(error, response, body)
        {
          debug('SNS auto-subscription done'); 
          debug('Topic ARN ' + data.TopicArn); 

          success = 'subscription' ;
        });
      }
      else {
        debug('Continue SNS processing'); 
        success = 'continue' ;
      }
    }
    else
    {
      debug('No information received'); 
      error = new Error('invalid request');
    }

    if(next) next(error,success);
  },
  parseSNSMessage : function(msg)
  {
    try {
      var parsed = JSON.parse(msg);
      return parsed;
    } catch (e) {
      return null ;
    }
  }
}
