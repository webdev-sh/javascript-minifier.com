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

// --------------------------------------------------------------------------------------------------------------------

var logStream = fs.createWriteStream('/var/log/javascript-minifier-com/app.log', { flags : 'a' });

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

    next();
});

var id = 0;
app.use(function(req, res, next) {
    id++;
    req.log = log2({ id : id, stream : logStream });
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
    res.render('index', { title: 'JavaScript Minifier' })
});

app.post('/minify', function(req, res) {
    req.log('/minify : uglifying input');
    var minimised;
    try {
        minimised = uglify.minify(req.body.input, { fromString: true });
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

app.get('/sitemap.txt', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.send("http://javascript-minifier.com/\n");
});

// --------------------------------------------------------------------------------------------------------------------
// export the server

module.exports = app;

// --------------------------------------------------------------------------------------------------------------------
