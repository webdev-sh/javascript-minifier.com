// --------------------------------------------------------------------------------------------------------------------
//
// Copyright (c) 2012-2013 AppsAttic Ltd - http://appsattic.com/
// Copyright (c) 2013 Andrew Chilton - http://chilts.org/
//
// --------------------------------------------------------------------------------------------------------------------

// npm
var redis = require('redis')
var rustle = require('rustle')
var log2 = require('log2')

// --------------------------------------------------------------------------------------------------------------------

var log = log2({ stream : process.stderr })

// redis
var client = redis.createClient()
client.select(1, () => {
  log('Redis Database selected')
})
client.on('ready', () => {
  log('Redis Ready')
})
client.on('connect', () => {
  log('Redis Connect')
})
client.on('drain', () => {
  log('Redis Drain')
})
client.on('idle', () => {
  log('Redis Idle')
})
client.on('error', (err) => {
  log('Redis Error : ' + err)
})
client.on('end', () => {
  log('Redis End')
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
