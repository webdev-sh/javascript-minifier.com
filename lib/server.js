// --------------------------------------------------------------------------------------------------------------------

var http = require('http');
var fs = require('fs');

var express = require('express');
var log2 = require('log2');
var flake = require('connect-flake')('eth0');
var uglify = require('uglify-js');

// --------------------------------------------------------------------------------------------------------------------

var logStream = fs.createWriteStream('/var/log/javascript-minifier-com/app.log', { flags : 'a' });

var app = express();

app.set('views', __dirname + '/../views');
app.set('view engine', 'jade');

// static routes
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
    if ( process.env.NODE_ENV === 'production') {
        res.locals.min = '.min';
    }
    else {
        app.locals.pretty = true;
        res.locals.min = '';
    }

    next();
});

app.use(flake);

app.use(function(req, res, next) {
    req.log = log2({ id : req.flake, stream : logStream });
    next();
});

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
    console.log(req.body.input);
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

app.get('/sitemap.txt', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.send("http://javascript-minifier.com/\n");
});

// --------------------------------------------------------------------------------------------------------------------
// export the server

module.exports = http.createServer(app);

// --------------------------------------------------------------------------------------------------------------------
