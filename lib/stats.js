// --------------------------------------------------------------------------------------------------------------------
//
// Copyright (c) 2012-2013 AppsAttic Ltd - http://appsattic.com/
// Copyright (c) 2013 Andrew Chilton - http://chilts.org/
//
// --------------------------------------------------------------------------------------------------------------------

// npm
var redis = require('redis')
var rustle = require('rustle')
var bole = require('bole')

// --------------------------------------------------------------------------------------------------------------------

const log = bole('lib/stats')

// redis
var client = redis.createClient()
client.select(1, () => {
  log.info('Redis Database selected')
})
client.on('ready', () => {
  log.info('Redis Ready')
})
client.on('connect', () => {
  log.info('Redis Connect')
})
client.on('drain', () => {
  log.info('Redis Drain')
})
client.on('idle', () => {
  log.info('Redis Idle')
})
client.on('error', (err) => {
  log.info('Redis Error : ' + err)
})
client.on('end', () => {
  log.info('Redis End')
})

var stats = {}

var pages = [ 'home', 'minify', 'download', 'raw' ]
pages.forEach((name) => {
  stats[name] = rustle({
    client       : client,
    domain       : 'javascript-minifier', // \
    category     : 'hits',                //  >- Keys: "<domain>:<category>:<name>"
    name         : name,                  // /
    period       : 24 * 60 * 60,          // one day
    aggregation  : 'sum',
  })
})

stats.pages = pages

// --------------------------------------------------------------------------------------------------------------------

module.exports = stats

// --------------------------------------------------------------------------------------------------------------------
