// --------------------------------------------------------------------------------------------------------------------
//
// Copyright (c) 2012-2013 AppsAttic Ltd - http://www.appsattic.com/
// Copyright (c) 2013 Andrew Chilton - http://chilts.org/
//
// --------------------------------------------------------------------------------------------------------------------

// core
const fs = require('fs')
const os = require('os')
const path = require('path')

// npm
const express = require('express')
const compress = require('compression')
const favicon = require('serve-favicon')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const uglify = require('uglify-js')
const connectBlog = require('connect-blog')
const moment = require('moment')
const yid = require('yid')
const LogFmtr = require('logfmtr')

// local
const pkg = require('../package.json')
const stats = require('./stats.js')
const pages = require('./pages.js')
const headers = require('./headers.js')
const minify = require('./minify.js')

// --------------------------------------------------------------------------------------------------------------------
// setup

const log = new LogFmtr()

const isProd = process.env.NODE_ENV === 'production'

const publicDir = path.join(__dirname, '..', 'public')

// --------------------------------------------------------------------------------------------------------------------
// app

log.info('in the app')

var app = express()
app.set('case sensitive routing', true)
app.set('strict routing', true)
app.set('views', path.join(__dirname, '..', 'views'))
app.set('view engine', 'pug')
app.enable('trust proxy')

app.locals.pkg = pkg
app.locals.env = process.env.NODE_ENV
app.locals.min = isProd ? '.min' : ''
app.locals.pretty = isProd
app.locals.page = pages.page // all the language examples

// static routes
app.use(compress())
app.use(favicon(path.join(publicDir, 'favicon.ico')))

if ( isProd ) {
  var oneMonth = 30 * 24 * 60 * 60 * 1000
  app.use(express.static(publicDir, { maxAge : oneMonth }))
}
else {
  app.use(express.static(publicDir))
}

app.use(morgan(isProd ? 'combined' : 'dev'))
app.use(bodyParser.urlencoded({
  extended : false,
  limit    : '3mb',
}))

// --------------------------------------------------------------------------------------------------------------------
// middleware

app.use((req, res, next) => {
  // add a Request ID
  req._rid = yid()

  // create a RequestID and set it on the `req.log`
  req.log = log.withFields({ rid: req._rid })

  next()
})

app.use(LogFmtr.middleware)

app.use((req, res, next) => {
  // set a `X-Made-By` header :)
  res.setHeader('X-Made-By', 'Andrew Chilton - https://chilts.org - @andychilton')

  // From: http://blog.netdna.com/opensource/bootstrapcdn/accept-encoding-its-vary-important/
  res.setHeader('Vary', 'Accept-Encoding')

  res.locals.title  = false
  res.locals.post   = false
  res.locals.blog   = undefined
  res.locals.moment = moment

  // add the advert
  res.locals.ad = {
    title : 'Digital Ocean',
    url   : 'https://www.digitalocean.com/?refcode=c151de638f83',
    src   : '/s/img/digital-ocean-728x90.jpg',
    text1 : 'We recommend ',
    text2 : ' for hosting your sites. Free $10 credit when you sign up.',
   }

  next()
})

// --------------------------------------------------------------------------------------------------------------------
// routes

app.get('/', headers, (req, res) => {
  stats.home.inc()
  res.render('index', { title: 'JavaScript Minifier' })
})

app.get(
  '/examples',
  headers,
  (req, res) => {
    res.render('examples', { title: 'Language Examples' })
  }
)

// render the whole page with the input and result
app.post('/minify', (req, res) => {
  // minify, checking the cache at the same time
  minify(req._rid, req.body.input, js => {
    stats.minify.inc()
    res.render('index', { title: 'JavaScript Minifier', input : req.body.input, output : js })
  })
})

// from a post, outputs the text and the text only (with a download header)
app.post('/download', (req, res) => {
  // minify, checking the cache at the same time
  minify(req._rid, req.body.input, js => {
    stats.download.inc()
    res.header('Content-Disposition', 'attachment; filename=code.min.js')
    res.header('Content-Type', 'text/plain')
    res.end(js)
  })
})

// from a post, outputs the text and the text only
app.post('/raw', (req, res) => {
  stats.raw.inc()

  res.header('Content-Type', 'text/plain')

  // if there is no input, just tell the user
  if ( !req.body.input ) {
    res.end('// input was empty')
    return
  }

  // minify, checking the cache at the same time
  minify(req._rid, req.body.input, js => {
    res.send(js)
  })
})

pages.routes(app)

app.get(
  '/plugins',
  headers,
  (req, res) => {
    res.render('plugins', { title : 'Editor Plugins which use CSS Minifier' })
  }
)

app.get(
  '/programs',
  headers,
  (req, res) => {
    res.render('programs', { title : 'Programs which use CSS Minifier' })
  }
)

app.get(
  '/stats',
  (req, res, next) => {
    var finished = false
    var got = 0
    var currentStats = {}

    // get some bits
    stats.pages.forEach((hitName) => {
      stats[hitName].values((err, data) => {
        if ( finished ) return
        if (err) {
          finished = true
          return next(err)
        }

        got += 1

        // save this hit
        data.forEach((hit) => {
          currentStats[hit.ts] = currentStats[hit.ts] || {}
          currentStats[hit.ts][hitName] = hit.val
        })

        // if we've got all the results, render the page
        if ( got === stats.pages.length ) {
          finished = true
          res.render('stats', { stats : currentStats, title : 'stats' })
        }
      })
    })
  }
)

var nakedDomain = 'javascript-minifier.com'
var baseUrl = 'https://' + nakedDomain

// blog
var blog = connectBlog({
  title       : 'JavaScript Minifier Blog',
  description : 'The JavaScript Minifier Blog, for All Your Minifying Needs!',
  contentDir  : path.join(__dirname, '..', 'blog'),
  domain      : nakedDomain,
  base        : '/blog',
})

app.get(
  '/blog',
  (req, res) => {
    res.redirect('/blog/')
  }
)

app.get(
  '/blog/',
  blog
)

app.get(
  '/blog/:path',
  blog
)

// create the sitemap with the blog posts too
var sitemap = [
  baseUrl + '/',
  baseUrl + '/plugins',
  baseUrl + '/programs',
]
pages.pages.forEach((pageName) => {
  sitemap.push(baseUrl + '/' + pageName)
})
blog.posts.forEach((post) => {
  sitemap.push(baseUrl + '/blog/' + post.name)
})
var sitemapTxt = sitemap.join('\n') + '\n'

app.get(
  '/sitemap.txt',
  (req, res) => {
    res.setHeader('Content-Type', 'text/plain')
    res.send(sitemapTxt)
  }
)

app.get(
  '/uptime',
  (req, res) => {
    res.setHeader('Content-Type', 'text/plain')
    res.send('' + parseInt(process.uptime(), 10))
  }
)

// --------------------------------------------------------------------------------------------------------------------
// export the app

module.exports = app

// --------------------------------------------------------------------------------------------------------------------
