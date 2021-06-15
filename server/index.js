const compression = require('compression')
const path = require('path')
const express = require('express')

const main = async () => {
  let api = express()
  //const server = process.env.NODE_ENV === 'development' ? http.Server(api) : https.Server(api)

  api.use(compression())
  api.use(express.json())
  api.use(express.urlencoded({ extended: true }))

  api.use((req, res, next) => {
    let origin = (req.headers && (req.headers.origin||req.headers.Origin))
    // intercepts OPTIONS method. CORS
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*')
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Credentials', 'true')

    let headers = [
      'Origin',
      'Accept',
      'User-Agent',
      'Accept-Charset',
      'Cache-Control',
      'Accept-Encoding',
      'Content-Type',
      'Authorization',
      'Content-Length',
      'X-Requested-With'
    ]

    res.setHeader("Access-Control-Allow-Headers", headers.join(', '))

    if ('OPTIONS' === req.method.toUpperCase()) {
      //respond with 200
      res.status(204)
      res.setHeader('Content-Length', '0')
      res.end()
    } else {
      //move on
      next()
    }
  })

  api.use(express.static(path.join(__dirname, '../dist')))

  const staticRoute = (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  }
  api.get('/*', staticRoute)

  const port = process.env.PORT || 6082
  const server = api.listen(port, () => {
    console.log(`API ready at port ${port}`)
  })
}

main().catch(console.error)
