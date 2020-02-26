// ----------------------------------------------------------------------------

'use strict'

// core
const path = require('path')

// npm
const express = require('express')
const compress = require('compression')
const favicon = require('serve-favicon')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const moment = require('moment')
const yid = require('yid')
const LogFmtr = require('logfmtr')
const connectContent = require('connect-content')
const ms = require('ms')

// local
const pkg = require('./pkg.js')
const env = require('./env.js')
const log = require('./log.js')
const stats = require('./stats.js')
const pages = require('./pages.js')
const headers = require('./headers.js')
const minify = require('./minify.js')

// ----------------------------------------------------------------------------
// setup

const publicDir = path.resolve(path.join(__dirname, '..', 'public'))
const viewsDir = path.resolve(path.join(__dirname, '..', 'views'))
const contentDir = path.join('/', __dirname, '..', 'content', 'article')

// articles
const articles = connectContent({ contentDir })

// create the sitemap
const sitemap = [
  env.baseUrl + '/',
  env.baseUrl + '/plugins',
  env.baseUrl + '/programs',
]
pages.pages.forEach((pageName) => {
  sitemap.push(env.baseUrl + '/' + pageName)
})
Object.keys(articles.page).forEach((pageName) => {
  sitemap.push(env.baseUrl + '/article/' + pageName)
})

// create the entire sitemapTxt
const sitemapTxt = sitemap.join('\n') + '\n'

// ----------------------------------------------------------------------------
// application server

const app = express()
app.set('case sensitive routing', true)
app.set('strict routing', true)
app.set('views', viewsDir)
app.set('view engine', 'pug')
app.enable('trust proxy')

app.locals.pkg = pkg
app.locals.env = env.locals
app.locals.page = pages.page // all the language examples
app.locals.title = pkg.title

app.use(compress())
app.use(favicon(path.join(publicDir, 'favicon.ico')))

if ( env.isProd ) {
  app.use(express.static(publicDir, { maxAge : ms('1 month') }))
}
else {
  app.use(express.static(publicDir))
}

app.use(morgan(env.isProd ? 'combined' : 'dev'))
app.use(bodyParser.urlencoded({
  extended : false,
  limit    : '3mb',
}))

// ----------------------------------------------------------------------------
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

  res.locals.moment = moment

  next()
})

// ----------------------------------------------------------------------------
// routes

function redirectToHome(req, res) {
  res.redirect('/')
}

app.get(
  '/',
  headers,
  (req, res) => {
    stats.home.inc()
    res.render('index')
  }
)

app.get('/article/:pagename', articles)

app.get('/minify', redirectToHome)
app.post(
  '/minify',
  (req, res, next) => {
    stats.minify.inc()

    minify(req._rid, req.body.input, (err, js) => {
      if (err) return next(err)
      res.render('index', { input: req.body.input, output: js })
    })
  }
)

app.get('/download', redirectToHome)
app.post(
  '/download',
  (req, res, next) => {
    stats.download.inc()

    minify(req._rid, req.body.input, (err, js) => {
      if (err) return next(err)
      res.header('Content-Disposition', 'attachment; filename=code.min.js')
      res.header('Content-Type', 'text/plain')
      res.end(js)
    })
  }
)

app.post(
  '/raw',
  (req, res, next) => {
    stats.raw.inc()

    minify(req._rid, req.body.input, (err, js) => {
      if (err) return next(err)
      res.header('Content-Type', 'text/plain')
      res.end(js)
    })
  }
)

pages.routes(app)

app.get(
  '/languages',
  headers,
  (req, res) => {
    res.render('languages', { title : 'Language Examples and Documentation' })
  }
)

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
  '/patrons',
  (req, res) => {
    res.render('patrons')
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

// ----------------------------------------------------------------------------
// export the app

module.exports = app

// ----------------------------------------------------------------------------
