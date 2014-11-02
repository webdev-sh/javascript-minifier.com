// --------------------------------------------------------------------------------------------------------------------
//
// app.js - the application for javascript-minifier.com
//
// Copyright (c) 2012-2013 AppsAttic Ltd - http://www.appsattic.com/
//
// --------------------------------------------------------------------------------------------------------------------

var fs = require('fs');

var express = require('express');
var uglify = require('uglify-js');
var log2 = require('log2');
var connectBlog = require('connect-blog');
var moment = require('moment');

// local
var log = require('./log.js');
var stats = require('./stats.js');

// --------------------------------------------------------------------------------------------------------------------
// set up some infrastructure prior to make the app

// logger
var log = log2();

// --------------------------------------------------------------------------------------------------------------------
// application server

var app = express();

app.set('views', __dirname + '/../views');
app.set('view engine', 'jade');

// static routes
app.use(express.compress());
app.use(express.favicon(__dirname + '/../public/favicon.ico'));

if ( process.env.NODE_ENV === 'production' ) {
    var oneMonth = 30 * 24 * 60 * 60 * 1000;
    app.use(express.static(__dirname + '/../public/'), { maxAge : oneMonth });
}
else {
    app.use(express.static(__dirname + '/../public/'));
}

app.use(express.logger());
app.use(express.bodyParser());

// --------------------------------------------------------------------------------------------------------------------
// middleware

var adverts = [
    {
        title : 'Digital Ocean',
        url   : 'https://www.digitalocean.com/?refcode=c151de638f83',
        src   : '/s/img/digital-ocean-728x90.jpg',
    },
    // {
    //     title : 'Unicode Tees',
    //     url   : 'http://teespring.com/UnicodeTees-03C0-Pi',
    //     src   : '/s/img/unicode-tees-728x90.jpg',
    // }
];
var nextAdvert = 0;

app.use(function(req, res, next) {
    res.locals.env = process.env.NODE_ENV;
    if ( process.env.NODE_ENV === 'production') {
        res.locals.min = '.min';
    }
    else {
        app.locals.pretty = true;
        res.locals.min = '';
    }

    res.locals.title  = false;
    res.locals.post   = false;
    res.locals.blog   = undefined;
    res.locals.moment = moment;

    // adverts, go to the next and set it
    nextAdvert++;
    if ( nextAdvert == adverts.length ) {
        nextAdvert = 0;
    }
    res.locals.ad = adverts[nextAdvert];

    next();
});

var id = 0;
app.use(function(req, res, next) {
    id++;
    req.log = log2({ id : id });
    next();
});

if ( process.env.NODE_ENV === 'production' ) {
    app.use(express.errorHandler());
}
else {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

function headers(req, res, next) {
    res.setHeader('X-Made-By', 'http://appsattic.com/');
    // From: http://blog.netdna.com/opensource/bootstrapcdn/accept-encoding-its-vary-important/
    res.setHeader('Vary', 'Accept-Encoding');
    next();
}

// --------------------------------------------------------------------------------------------------------------------
// routes

app.get('/', headers, function(req, res) {
    req.log('/ : Rendering index');
    stats.home.inc();
    res.render('index', { title: 'JavaScript Minifier' })
});

app.get(
    '/examples',
    headers,
    function(req, res) {
        req.log('/examples : entry');
        res.render('examples', { title: 'Language Examples' });
    }
);

app.post('/minify', function(req, res) {
    req.log('/minify : uglifying input');
    var minimised;
    try {
        minimised = uglify.minify(req.body.input, { fromString: true });
        stats.minify.inc();
    }
    catch (err) {
        req.log('Invalid input : ' + err.message);
        minimised = { code : '// Error: ' + err.message };
    }
    res.render('index', { title: 'JavaScript Minifier', input : req.body.input, output : minimised.code })
});

// from a post, outputs the text and the text only (with a download header)
app.post('/download', function(req, res) {
    req.log('/download : uglifying input');
    var minimised;
    try {
        minimised = uglify.minify(req.body.input, { fromString: true });
        stats.download.inc();
    }
    catch (err) {
        req.log('Invalid input : ' + err.message);
        minimised = { code : '// Error: ' + err.message };
    }

    res.header('Content-Disposition', 'attachment; filename=javascript.js');
    res.header('Content-Type', 'text/plain');
    res.end(minimised.code);
});

// from a post, outputs the text and the text only
app.post('/raw', function(req, res) {
    req.log('/raw : uglifying input');
    var minimised;
    if ( req.body.input ) {
        try {
            minimised = uglify.minify(req.body.input, { fromString: true });
            stats.raw.inc();
        }
        catch (err) {
            req.log('Invalid input : ' + err.message);
            minimised = { code : '// Error: ' + err.message };
        }
    }
    else {
        minimised = '';
    }
    res.header('Content-Type', 'text/plain');
    res.end(minimised.code);
});

app.get(
    '/stats',
    function(req, res, next) {
        var finished = false;
        var got = 0;
        var currentStats = {};

        // get some bits
        stats.pages.forEach(function(hitName) {
            stats[hitName].values(function(err, data) {
                if ( finished ) return;
                if (err) {
                    finished = true;
                    return next(err);
                }

                got += 1;

                // save this hit
                data.forEach(function(hit) {
                    currentStats[hit.ts] = currentStats[hit.ts] || {};
                    currentStats[hit.ts][hitName] = hit.val;
                });

                // if we've got all the results, render the page
                if ( got === stats.pages.length ) {
                    finished = true;
                    res.render('stats', { stats : currentStats, title : 'stats' });
                }
            });
        });
    }
);

var blog = connectBlog({
    title       : 'JavaScript Minifier Blog',
    description : 'The JavaScript Minifier Blog, for All Your Minifying Needs!',
    contentDir  : __dirname + '/../blog',
    domain      : 'javascript-minifier.com',
    base        : '/blog',
});

app.get(
    '/blog/',
    blog
);

app.get(
    '/blog/:path',
    blog
);

app.get(
    '/blog',
    function(req, res) {
        res.redirect('/blog/');
    }
);

// create the sitemap with the blog posts too
var sitemap = [
    "http://javascript-minifier.com/",
    "http://javascript-minifier.com/examples",
];
blog.posts.forEach(function(post) {
    sitemap.push("http://javascript-minifier/blog/" + post.name);
});

app.get(
    '/sitemap.txt',
    function(req, res) {
        res.setHeader('Content-Type', 'text/plain');
        res.send(sitemap.join("\n") + "\n");
    }
);

// --------------------------------------------------------------------------------------------------------------------
// export the server

module.exports = app;

// --------------------------------------------------------------------------------------------------------------------
