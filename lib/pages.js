// ----------------------------------------------------------------------------

'use strict'

// local
var headers = require('./headers.js')

// ----------------------------------------------------------------------------
// setup

var page = {
  'api'   : {
    title : 'Using the JavaScript Minifier API',
    name  : 'API',
  },
  'wget'   : {
    title : 'Using javascript-minifier.com with wget',
    name  : 'wget',
  },
  'curl'   : {
    title : 'Using javascript-minifier.com with curl',
    name  : 'Curl',
  },
  'nodejs' : {
    title : 'Using javascript-minifier.com in Node.js',
    name  : 'Node.js',
  },
  'python' : {
    title : 'Using javascript-minifier.com in Python',
    name  : 'Python',
  },
  'java' : {
    title : 'Using javascript-minifier.com in Java',
    name  : 'Java',
  },
  'ruby'   : {
    title : 'Using javascript-minifier.com in Ruby',
    name  : 'Ruby',
  },
  'perl'   : {
    title : 'Using javascript-minifier.com in Perl',
    name  : 'Perl',
  },
  'php'    : {
    title : 'Using javascript-minifier.com in PHP',
    name  : 'PHP',
  },
  'c-sharp'    : {
    title : 'Using javascript-minifier.com in C#',
    name  : 'C#',
  },
  'rust'    : {
    title : 'Using javascript-minifier.com in Rust',
    name  : 'Rust',
  },
  'kotlin'    : {
    title : 'Using javascript-minifier.com in Kotlin',
    name  : 'Kotlin',
  },
}

var pages = Object.keys(page)

// the routes function (adds routes to the app object)
function routes(app) {

  pages.forEach((pageName) => {
    app.get(
      '/' + pageName,
      headers,
      (req, res) => {
        res.render(pageName, { title : page[pageName].title })
      }
    )
  })

}

// ----------------------------------------------------------------------------

module.exports.routes = routes
module.exports.page   = page
module.exports.pages  = pages

// ----------------------------------------------------------------------------
