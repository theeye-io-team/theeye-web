/* global sails */
const AWS = require('aws-sdk')
const request = require('request')
const SNS = new AWS.SNS(new AWS.Config(sails.config.aws))
const logger = require('../logger')('libs:notifications:sns')
const sockets = require('./sockets')
const zlib = require('zlib')
const uuidv1 = require('uuid/v1')

const redisExpires = 120 // seconds. this is time to redistribute the message to all web instances

module.exports = {
  send (message) {
    const sockets_arn = sails.config.sns.sockets_arn
    serializeMessage(message, (err,uid) => {

      if (err) {
        logger.error('Error serializing sns message %o', err)
        return
      }

      if (!sails.config.is_cluster) {
        logger.debug('[DEBUG ENABLED] Submit message to EventsHandler (directly)')

        if (sails.config.sns.debug!==true) {
          logger.debug('Submiting message via Socket')
          sockets.emit(message.topic, message, (err) => {
            if (err) logger.error('%o',err)
          })
        } else {
          const eventsHandlerUri = sails.config.application.baseUrl + '/events/update'
          request.post({
            tunnel: true,
            gzip: true,
            uri: eventsHandlerUri,
            headers: { 'content-type': 'application/json' },
            form: {
              TopicArn: sockets_arn,
              Message: JSON.stringify({ message_id: uid })
            }
          }, (error, response, body) => {
            if (error) {
              logger.error('upload failed: %o', error)
            }
          })
        }
      } else {
        logger.debug('Submit message via AWS-SNS')

        SNS.publish({
          TopicArn: sockets_arn,
          Message: JSON.stringify({ message_id: uid })
        }, (err,data) => {
          if (err) {
            logger.error('error. aws sns submit failed')
            logger.error('%o',err)
            return
          }

          logger.debug(data)
        })
      }
    })
  },
  receive (data, next) {
    if (typeof data != 'undefined') {
      if (data.Type && data.Type=='SubscriptionConfirmation') {
        //request(data.SubscribeURL, (err, res, body) 
        request(data.SubscribeURL, (/** args... **/) => {
          logger.debug('SNS auto-subscription done')
          logger.debug('Topic ARN ' + data.TopicArn)
          return next(null,false)
        })
      } else {
        logger.debug('Processing SNS message')
        deserializeMessage(data.Message, (err, originalMessage) => {
          if (err) {
            return next( new Error('message retrieval failed') )
          }
          return next(null, originalMessage)
        })
      }
    } else {
      logger.error('No information received')
      var err = new Error('invalid request')
      next(err)
    }
  }
}

const parseJsonMessageString = (msg) => {
  try {
    return JSON.parse(msg)
  } catch (e) {
    return null
  }
}



/**
 *
 * serialize/deserialize sns message data.
 *
 * @summary save and restore data from redis cache. save to generate an id , then use the same id to restore data and send to clients via socket. avoid sending huge amount of information directly via sns or another service
 *
 */
const serializeMessage = (msg, next) => {
  let uid = uuidv1()
  compressMessage(msg, (err, data) => {
    sails.redis.set(
      uid, data,
      'EX', redisExpires,
      function (err) {
        if (err) logger.error('%o',err)

        next(err, uid)
      }
    )
  })
}

const compressMessage = (msg, next) => {
  var data = JSON.stringify(msg) // convert to json string before compress

  return next(null, data) // return uncompressed. we have to handle charset before, or deserialization will fail

  //zlib.gzip(data, (err, cmpBuffer) => {
  //  if (err) {
  //    logger.debug('%o',err)
  //    return next(err)
  //  }
  //  next(err, cmpBuffer.toString('base64'))
  //})
}

const deserializeMessage = (data, next) => {
  let uid = parseJsonMessageString(data).message_id

  sails.redis.get(uid, function (err, data) {
    if (err) {
      logger.error('%o',err)
      return next(err)
    }

    if (!data) {
      let err = new Error('internal SNS message not found in cache')
      logger.error('%o',err)
      return next(err)
    }

    uncompressMessage(data, next)
  })
}

const uncompressMessage = (data, next) => {

  try {
    let msg = JSON.parse(data)
    return next(null, msg)
  } catch (e) {
    logger.error(e)
    return next(e)
  }

  //let cmpBuffer = Buffer.from(data, 'base64')
  //zlib.unzip(cmpBuffer, (err, uncmpBuffer) => {
  //  try {
  //    let msg = uncmpBuffer.toString('utf8') // <<< this is not always utf8, also could be ascii , in which case JSON.parse will fail
  //    let data = JSON.parse(msg)
  //    return next(null, data)
  //  } catch (e) {
  //    logger.debug(e)
  //    return next(e)
  //  }
  //})
}
