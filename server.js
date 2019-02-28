// --------------------------------------------------------------------------------------------------------------------
//
// server.js - the server for javascript-minifier.com
//
// Copyright 2013 AppsAttic Ltd, http://appsattic.com/
//
// --------------------------------------------------------------------------------------------------------------------

"use strict"

// core
const http = require('http')

// local
const log = require('./lib/log.js')
const app = require('./lib/app.js')

// --------------------------------------------------------------------------------------------------------------------
// setup

process.title = 'javascript-minifier.com'

// every so often, print memory usage
var memUsageEverySecs = process.env.NODE_ENV === 'production' ? 10 * 60 : 30
setInterval(() => {
  log.withFields(process.memoryUsage()).debug('memory')
}, memUsageEverySecs * 1000)

// --------------------------------------------------------------------------------------------------------------------
// server

const server = http.createServer()
server.on('request', app)

const port = process.env.PORT || 8021
server.listen(port, function() {
  log.withFields({ port }).info('server-started')
})

process.on('SIGTERM', () => {
  log.info('sigterm')
  server.close(() => {
    log.info('exiting')
    process.exit(0)
  })
})

// --------------------------------------------------------------------------------------------------------------------
