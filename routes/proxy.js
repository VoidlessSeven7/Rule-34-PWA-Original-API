const express = require('express'),
  https = require('https'),
  router = express.Router(),
  urlRegex = require('url-regex'),
  debug = require('debug')(`Proxy`)

/* Act as a proxy with cors for data */
router.get('/', function(req, res, next) {
  // If theres no url
  if (!req.query.url) {
    res.status(400)
    res.json({ error: 'Please use ?url=' })
    return next()
  }

  // If url is not valid
  if (!urlRegex().test(req.query.url)) {
    res.status(400)
    res.json({ error: 'Please send a valid URL' })
    return next()
  }

  // Get the requested url image and respond with it
  const request = https.get(req.query.url, response => {
    res.setHeader('Content-Type', response.headers['content-type'])
    res.setHeader('Cache-Control', 'max-age=31557600') // Thanks to @KuroZenZen for this code
    response.pipe(res)
  })

  request.on('error', function(e) {
    res.json({ error: e })
    debug(e)
  })
})

module.exports = router