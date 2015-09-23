'use strict';

// Load dev environment if not on Bluemix
if (!process.env.VCAP_SERVICES) {
  require('dotenv').load();
}

// Set Config
var PUSHER = JSON.parse(process.env.PUSHER);

// Required Libraries
var Path   = require('path');
var Hapi   = require('hapi');
var Inert  = require('inert');
var Pusher = require('pusher');

// Instantiate the server
var server = new Hapi.Server({
  debug: {
    request: ['error','good'],
  },
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public'),
      },
    },
  },
});

// Set Hapi Connections
server.connection({
  host: process.env.VCAP_APP_HOST || 'localhost',
  port: process.env.VCAP_APP_PORT || 3000,
});

// Hapi Log
server.log(['error', 'database', 'read']);

// Register Hapi Plugins
server.register(Inert, function() {});

// Setup Pusher
var pusher = new Pusher({
  appId: PUSHER.appId,
  key: PUSHER.key,
  secret: PUSHER.secret,
  encrypted: PUSHER.encrypted,
});
pusher.port = PUSHER.port;

// Static site
server.route({
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: '.',
      redirectToSlash: true,
      index: true,
    },
  },
});

// Notification: Bt.tn
server.route({
  method: 'POST',
  path: '/notification/bttn',
  handler: function(req, reply) {

    pusher.trigger('notifications', 'bttn', {
      'message': 'Katy needs help!',
    });

    // Just so it hits something
    reply({});
  },
});

// Start Hapi
server.start(function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Server running at:', server.info.uri);
  }
});
