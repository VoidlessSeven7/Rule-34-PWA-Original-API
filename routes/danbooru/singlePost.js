const express = require('express'),
  domainConfig = require('./domainConfig'),
  xmlToJsonFromUrl = require('../../utils/xmlToJsonFromUrl.js'),
  router = express.Router(),
  { check, validationResult } = require('express-validator'),
  debug = require('debug')(`danbooru single-post`)

/* GET posts. */
router.get(
  '/',
  [
    check('id').isInt(),
    check('corsProxy')
      .isBoolean()
      .toBoolean()
      .optional(),
  ],
  async function(req, res) {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    // Get the requested parameters and create a url to request data with it
    const requestUrl = applyUrlParameters(req)
    debug(requestUrl)

    // Process through wich the xml request gets transformed to optimized json
    let jsonResult = await xmlToJsonFromUrl({
      url: requestUrl,
      template: 'posts',
      domain: 'danbooru-single',
      isJson: true,
      useCorsProxy: req.query.corsProxy,
    })

    // Reply to the client
    res.json(jsonResult)
  }
)

// Separated applying of query parameters
function applyUrlParameters(req) {
  // Default query parameters
  const postId = req.query.id

  // Return full url
  let builtUrl = domainConfig.apiUrl + '/' + postId + '.json'

  // Return the complete built url
  return builtUrl
}

module.exports = router