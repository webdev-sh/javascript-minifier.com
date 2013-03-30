// ----------------------------------------------------------------------------
//
// app.js - the server for javascript-minifier.com
//
// Copyright 2013 AppsAttic Ltd, http://appsattic.com/
//
// ----------------------------------------------------------------------------

var cluster = require('cluster');
var os      = require('os');

"use strict";

// ----------------------------------------------------------------------------

var forks = process.env.NODE_ENV === 'development' ? 1 : 3;

// ----------------------------------------------------------------------------

if( cluster.isMaster ) {
    process.title = 'parent.javascript-minifier.com';
    for( var i = 0; i < forks; i++ ) {
        console.log('Starting child...');
        cluster.fork();
    }

    cluster.on('exit', function(worker) {
        console.log( 'Worker ' + worker.process.pid + ' died.' );
        cluster.fork();
    });
}
else {
    process.title = 'child.javascript-minifier.com';
    console.log('Worker %s started', process.pid);
    var server = require('./lib/server.js');
    var port = 3000;
    server.listen(port, function() {
        console.log('Worker %s listening on port %s', process.pid, port);
    });

}

// ----------------------------------------------------------------------------
