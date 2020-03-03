// Requirements
const express = require('express'),
  generalConfig = require('./generalConfig'),
  // Plugins
  bodyParser = require('body-parser'),
  compression = require('compression'),
  cors = require('cors'),
  logger = require('morgan'),
  helmet = require('helmet'),
  apicache = require('apicache'),
  rateLimit = require('express-rate-limit'),
  errorHandler = require('errorhandler'),
  favicon = require('serve-favicon'),
  // Routes
  indexerRouter = require('../routes/indexer.router'),
  // Init
  app = express(),
  cache = apicache.middleware,
  rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 225, // 15 requests per minute
  })

// Security and default plugins
app
  // Because of Heroku
  .set('trust proxy', 1)
  // Common config
  .set('port', generalConfig.port)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true })) // TODO: See what it does
  .use(compression({ threshold: 0 }))
  .use(helmet())
  .disable('x-powered-by') // Remove powered by

  // Cosmetic plugins
  .use(favicon(__dirname + '/../static/favicon.ico'))

if (generalConfig.env === 'development') {
  app
    // Log everything and show full errors
    .use(logger('dev'))
    .use(errorHandler())

    // Allow all origins
    .use(
      cors({
        methods: ['GET'],
        allowedHeaders: ['Content-Type'],
      })
    )
} else {
  // Log errors only and use cache
  app
    .use(
      logger('dev', {
        skip: function(req, res) {
          return res.statusCode < 400
        },
      })
    )

    // Allow only access from my app
    // EDIT: For some reason it does not return a 'Access-Control-Origin' header when its not from this site, otherwise it perfectly works
    .use(
      cors({
        origin: 'https://r34.app', // Only allow use from the Rule34 App
        methods: ['GET'],
        allowedHeaders: ['Content-Type'],
      })
    )

    // Use a memory based cache
    .use(cache('5 minutes'))

    .get('/cache/performance', (req, res) => {
      res.json(apicache.getPerformance())
    })

    .get('/cache/index', (req, res) => {
      res.json(apicache.getIndex())
    })

    // Rate limit
    .use(rateLimiter)
}

// Import all Routes
app.use(indexerRouter)

// Export
module.exports = app
