// ----------------------------------------------------------------------------
//
// server.js - the server for javascript-minifier.com
//
// Copyright 2013 AppsAttic Ltd, http://appsattic.com/
//
// ----------------------------------------------------------------------------

var cluster = require('cluster');
var http = require('http');

"use strict";

// ----------------------------------------------------------------------------

var forks = process.env.NODE_ENV === 'production' ? 2 : 1;
var memUsageEverySecs = process.env.NODE_ENV === 'production' ? 10 * 60 : 10;
var dieInSecs = process.env.NODE_ENV === 'production' ? 3600 + Math.floor(Math.random() * 1800) : 60 + Math.floor(Math.random() * 30);

// ----------------------------------------------------------------------------

function log() {
    var args = Array.prototype.slice.call(arguments);
    args[0] = (new Date()).toISOString() + ' - ' + args[0];
    console.log.apply(console, args);
};

if (cluster.isMaster) {
    process.title = 'parent.javascript-minifier.com';
    for( var i = 0; i < forks; i++ ) {
        log('MASTER: Starting child...');
        cluster.fork();
    }

    cluster.on('fork', function(worker) {
        log('MASTER: Worker ' + worker.process.pid + ' has been forked');
    });

    cluster.on('online', function(worker) {
        log('MASTER: Worker ' + worker.process.pid + ' has responded to say it is online');
    });

    cluster.on('listening', function(worker, address) {
        log('MASTER: Worker ' + worker.process.pid + ' is now connected to ' + address.address + ':' + address.port);
    });

    cluster.on('disconnect', function(worker) {
        log('MASTER: Worker ' + worker.process.pid + ' is now disconnecting (prior to dieing)');
    });

    cluster.on('exit', function(worker, code, signal) {
        var exitCode = worker.process.exitCode;
        log('MASTER: worker ' + worker.process.pid + ' died (' + exitCode + ') due to ' + signal + '.');
        cluster.fork();
    });
}
else {
    // child
    var worker = cluster.worker;
    process.title = 'child.javascript-minifier.com';

    log('WORKER(%s,%s): Worker started', worker.id, process.pid);

    var app = require('./lib/app.js');
    var port = process.argv[2] || 8021;

    var server = http.createServer();
    server.on('request', app);

    server.listen(port, function() {
        log('WORKER(%s,%s): Worker listening on port %s', worker.id, process.pid, port);
    });

    // every hour (+-30mins) or so, disconnect so that the master can spawn a new process
    log('WORKER(%s,%s): Dieing in %s seconds', worker.id, process.pid, dieInSecs);
    setTimeout(function() {
        log('WORKER(%s,%s): Disconnecting myself', worker.id, process.pid);
        worker.disconnect();
        setTimeout(function() {
            log('WORKER(%s,%s): Killing myself', worker.id, process.pid);
            worker.kill();
        }, 2000);
    }, dieInSecs * 1000);

    // every 10 mins, print memory usage
    setInterval(function() {
        var mem       = process.memoryUsage();
        mem.rss       = Math.floor(mem.rss/1024/1024) + 'MB';
        mem.heapTotal = Math.floor(mem.heapTotal/1024/1024) + 'MB';
        mem.heapUsed  = Math.floor(mem.heapUsed/1024/1024) + 'MB';
        log('WORKER(%s,%s): memory - rss=%s, heapUsed=%s, heapTotal=%s', worker.id, process.pid, mem.rss, mem.heapUsed, mem.heapTotal);
    }, memUsageEverySecs * 1000);
}

// ----------------------------------------------------------------------------
