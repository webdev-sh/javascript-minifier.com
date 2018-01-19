// ----------------------------------------------------------------------------
//
// server.js - the server for javascript-minifier.com
//
// Copyright 2013 AppsAttic Ltd, http://appsattic.com/
//
// ----------------------------------------------------------------------------

"use strict"

// core
const http = require('http')

// npm
const bole = require('bole')

// local
const app = require('./lib/app.js')

// --------------------------------------------------------------------------------------------------------------------
// setup

const isProd = process.env.NODE_ENV === 'production'

process.title = 'javascript-minifier.com'

// logging
bole.output({
  level  : isProd ? 'info' : 'debug',
  stream : process.stdout,
})
const log = bole('server')

var memUsageEverySecs = isProd ? 10 * 60 : 30

// ----------------------------------------------------------------------------

const server = http.createServer()
server.on('request', app)

const port = process.env.PORT || 8021
server.listen(port, function() {
  log.info('Listening on port %s', port)
})

// every so often, print memory usage
setInterval(() => {
  const mem     = process.memoryUsage()
  mem.rss       = Math.floor(mem.rss/1024/1024) + 'MB'
  mem.heapTotal = Math.floor(mem.heapTotal/1024/1024) + 'MB'
  mem.heapUsed  = Math.floor(mem.heapUsed/1024/1024) + 'MB'
  log.info('Memory: rss=%s, heapUsed=%s, heapTotal=%s', mem.rss, mem.heapUsed, mem.heapTotal)
  log.info('Memory', mem)
}, memUsageEverySecs * 1000)

// ----------------------------------------------------------------------------
