// ----------------------------------------------------------------------------

"use strict"

// npm
const redis = require('redis')
const rustle = require('rustle')

// ----------------------------------------------------------------------------

// redis
const client = redis.createClient()

const stats = {}

const pages = [ 'home', 'minify', 'download', 'raw' ]
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

// ----------------------------------------------------------------------------

module.exports = stats

// ----------------------------------------------------------------------------
