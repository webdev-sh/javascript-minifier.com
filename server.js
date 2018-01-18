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

// local
const app = require('./lib/app.js')

// --------------------------------------------------------------------------------------------------------------------
// setup

process.title = 'javascript-minifier.com'

var memUsageEverySecs = process.env.NODE_ENV === 'production' ? 10 * 60 : 30

// ----------------------------------------------------------------------------

function log() {
  var args = Array.prototype.slice.call(arguments)
  args[0] = (new Date()).toISOString() + ' - ' + args[0]
  console.log.apply(console, args)
}

const server = http.createServer()
server.on('request', app)

const port = process.env.PORT || 8021
server.listen(port, function() {
  log('Listening on port %s', port)
})

// every so often, print memory usage
setInterval(() => {
  const mem     = process.memoryUsage()
  mem.rss       = Math.floor(mem.rss/1024/1024) + 'MB'
  mem.heapTotal = Math.floor(mem.heapTotal/1024/1024) + 'MB'
  mem.heapUsed  = Math.floor(mem.heapUsed/1024/1024) + 'MB'
  log('Memory: rss=%s, heapUsed=%s, heapTotal=%s', mem.rss, mem.heapUsed, mem.heapTotal)
}, memUsageEverySecs * 1000)

// ----------------------------------------------------------------------------
