// ----------------------------------------------------------------------------

"use strict"

// core
const http = require('http')
const ms = require('ms')

// local
const pkg = require('./lib/pkg.js')
const log = require('./lib/log.js')
const app = require('./lib/app.js')

// ----------------------------------------------------------------------------
// setup

process.title = pkg.name

// every so often, print memory usage
var memUsageEveryMs = process.env.NODE_ENV === 'production' ? ms('10 mins') : ms('30s')
setInterval(() => {
  log.withFields(process.memoryUsage()).debug('memory')
}, memUsageEveryMs)

// ----------------------------------------------------------------------------
// server

const server = http.createServer()
server.on('request', app)

const port = process.env.PORT || 8021
server.listen(port, () => {
  log.withFields({ port }).info('server-started')
})

process.on('SIGTERM', () => {
  log.info('sigterm')
  server.close(() => {
    log.info('exiting')
    process.exit(0)
  })
})

// ----------------------------------------------------------------------------
