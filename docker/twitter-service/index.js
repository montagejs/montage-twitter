/* global __dirname, process, Promise */

var https = require('https');
var spdy = require('spdy');
var express = require('express');
var session = require('express-session');
var fs = require('fs');
var Twitter = require('twitter');
var TwitterStrategy = require('passport-twitter');
var passport = require('passport');

/* 
// To enable Push
var https = require('spdy');
*/

//
// Configure app
//

var app = express();

// Path
app.set('ROOT_PATH', __dirname);
// app.set('PUBLIC_PATH', process.env.PUBLIC_PATH || app.get('ROOT_PATH') + '/public/');
app.set('PUBLIC_PATH', process.env.PUBLIC_PATH || app.get('ROOT_PATH') + '/../../');

// App
app.set('APP_SSL', process.env.APP_SSL || true);
app.set('APP_PORT', process.env.APP_PORT || 8080);
app.set('APP_HOST', process.env.APP_HOST || 'localhost');
app.set('APP_URL', process.env.APP_URL || (app.get('APP_SSL') ? 'https' : 'http') + '://' + app.get('APP_HOST') + ':' + app.get('APP_PORT'));


// Set default env
app.set('TWITTER_CONSUMER_KEY', process.env.TWITTER_CONSUMER_KEY || "YYmrT8z8xBsAMBWJeqhhmnxXD");
app.set('TWITTER_CONSUMER_SECRET', process.env.TWITTER_CONSUMER_SECRET || "KmNYBsjmnEHlIghivYKFcbqGu4dSxzQ7qOvGFtMIYb1zirwkbi");


// Expose statics
var PUBLIC_PATH = app.get('PUBLIC_PATH');
app.use(express.static(PUBLIC_PATH, {
  index: false
}));

// Trust first proxy
app.set('trust proxy', 1);

// Configure passport
passport.serializeUser(function(user, next) {
  next(null, user);
});

passport.deserializeUser(function(id, next) {
  next(null, id);
});

var APP_URL = app.get('APP_URL'),  
    TWITTER_CONSUMER_KEY = app.get('TWITTER_CONSUMER_KEY'),
    TWITTER_CONSUMER_SECRET = app.get('TWITTER_CONSUMER_SECRET');

app.use(passport.initialize());
  passport.use(new TwitterStrategy({
    passReqToCallback: true,
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: APP_URL + "/auth/twitter/callback"
  },
  function(req, token, tokenSecret, profile, next) {
    next(null, {
      token: token,
      tokenSecret: tokenSecret,
      profile: profile
    });
  }
));

// Init session (Required by passport-twitter)
app.use(session({
  secret: "bla",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

//
// Expose routes
//

function readFile(path) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path, function (err, file) {
      if (err) {
        reject(err);
      } else {
        resolve(file);
      }
    });
  });
}

app.get('/', function(req, res) {
    // Render index.html and push montage.js
    Promise.all([
      readFile(PUBLIC_PATH + '/index.html'),
      readFile(PUBLIC_PATH + '/node_modules/montage/montage.js'),
      readFile(PUBLIC_PATH + '/package.json'),
    ]).then(function (files) {

      // Does the browser support push?
      if (res.push) {

          // The JS file
          var montagePush = res.push('/node_modules/montage/montage.js', {
              req: {'accept': '**/*'},
              res: {'content-type': 'application/javascript'}
          });

          montagePush.on('error', function (err) {
              console.error(err);
          });

          montagePush.end(files[1]);

          // The Package file
          var pkgPush = res.push('/package.json', {
              req: {'accept': '**/*'},
              res: {'content-type': 'application/json'}
          });

          pkgPush.on('error', function (err) {
              console.error(err);
          });

          pkgPush.end(files[2]);
      }

      res.writeHead(200);
      res.end(files[0]);

    }).catch(function (error) {
    	res.status(500).send(error.toString());
    });
});

// Start auth process
app.get('/auth/twitter', function (req, res, next) {

  var options = {
    failWithError: true,
    session: false,
    state: req.params.state ? req.params.state : Date.now()
  };

  passport.authenticate('twitter', options)(req, res, function (err) {
    if (err) {
      res.redirect('/auth/twitter/result#error=' + JSON.stringify(err.message || err));
    } else {
      next();
    }
  });
});

// Handle auth process callback
app.get('/auth/twitter/callback', function (req, res, next) {

  var options = {
    failWithError: true,
    session: false,
    state: req.params.state ? req.params.state : Date.now()
  };

  return passport.authenticate('twitter', options)(req, res, function (err) {
    if (err) {
      res.redirect('/auth/twitter/result#error=' + JSON.stringify(err.message || err));
    } else {
      res.redirect('/auth/twitter/result#result=' + JSON.stringify(req.user));
    }
  });
});

// Handle auth process result
app.get('/auth/twitter/result', function (req, res, next) {
  // Empty
  res.end();
});

// Twitter api proxy
<<<<<<< HEAD
app.get('/api/twitter/:twitterObject/:twitterAction', function (req, res, next) {
  
  var twitterObject = req.params.twitterObject,
      twitterAction = req.params.twitterAction,
=======
app.get('/api/twitter/:twitter_object/:twitter_action', function (req, res, next) {

  var twitterObject = req.params.twitter_object,
      twitterAction = req.params.twitter_action,
>>>>>>> Fix paths
      twitterParams = req.query;

  if (0) {
      readFile(PUBLIC_PATH + '/logic/service/twitter-' + twitterObject + '-' + twitterAction + '.json').then(function (file) {
          res.writeHead(200);
          res.end(file);
      }, function (err) {
        next(err);
      });

  } else {

    var accesToken = {
        token: req.query.token || req.headers['authorization-token'],
        secret: req.query.secret || req.headers['authorization-secret']
    };

    var client = new Twitter({
        consumer_key: TWITTER_CONSUMER_KEY,
        consumer_secret: TWITTER_CONSUMER_SECRET,
        access_token_key: accesToken.token,
        access_token_secret: accesToken.secret
    });

    // TODO implement http2 push
    // - https://blog.twitter.com/2008/what-does-rate-limit-exceeded-mean-updated
    console.log('Twitter API call', twitterObject, twitterAction, twitterParams);
    client.get(twitterObject + '/' + twitterAction, twitterParams, function(errors, tweets /*,response*/) {
      if (errors) {
          next(errors[0]);
      } else {
          res.json(tweets);
      }
    });
  }
});


app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500);
<<<<<<< HEAD
  res.end(err.message);  
});
=======
  res.end(err.message);
})
>>>>>>> Fix paths

//
// Start http server
//


var APP_PORT = app.get('APP_PORT'),  
    APP_SSL = app.get('APP_SSL'),
    CERT_PATH = app.get('ROOT_PATH') + '/certs/';

if (APP_PORT === 443) {
  var forwardingServer = express();

  forwardingServer.all('*', function(req, res) {
      return res.redirect("https://" + APP_URL + req.url);
  });

  forwardingServer.listen(80);
}

if (APP_SSL === true) {

  https
    .createServer({
        key: fs.readFileSync(CERT_PATH + '/private.key'),
        cert:  fs.readFileSync(CERT_PATH + '/public.crt')
    }, app)
    .listen(APP_PORT, function (error) {
      if (error) {
        console.error(error);
        return process.exit(1);
      } else {
        console.log('(https) Listening on port: ' + APP_PORT + '.');
      }
    });
} else {
  app.listen(APP_PORT);
  console.log('(http) Listening on port: ' + APP_PORT + '.');
<<<<<<< HEAD
} 
=======
}
>>>>>>> Fix paths
