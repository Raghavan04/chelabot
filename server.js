'use strict';

var chelaBot = require('./components/chela-bot');
var express = require('express');
var http = require('http');

var app = express();
var server = http.createServer(app);

app.configure(function() {
    app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8080);
    app.set('ipaddr', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    // Enable CORS
    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    app.use(express.static(__dirname + '/public'));
});

server.listen(app.get('port'), app.get('ipaddr'), function() {
    console.log('Server ip: ' + app.get('ipaddr') + ' port ' + app.get('port'));
});

chelaBot.init(function(err) {
    if(err) return console.error(err);
    console.log('ChelaBot has been initialiazed successfully...');
});