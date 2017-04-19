
var spdy = require('spdy');
var express = require('express');
var session = require('express-session');
var path = require('path');
var fs = require('fs');
var Twitter = require('twitter');
var TwitterStrategy = require('passport-twitter');
var passport = require('passport');

// Path

var ROOT_PATH = __dirname + '/..';
var PUBLIC_PATH = ROOT_PATH + '/public';

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

// Set default env
process.env.TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY || "YYmrT8z8xBsAMBWJeqhhmnxXD";
process.env.TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET || "KmNYBsjmnEHlIghivYKFcbqGu4dSxzQ7qOvGFtMIYb1zirwkbi";

process.env.APP_PORT = process.env.APP_PORT || 3000;
process.env.APP_URL = process.env.APP_URL || 'https://localhost:' + process.env.APP_PORT;


//
// Configure app
//

var app = express();

// Expose statics
app.use(express.static(PUBLIC_PATH));

// Trust first proxy
app.set('trust proxy', 1);

// Configure passport
passport.serializeUser(function(user, next) {
    next(null, user);
});

passport.deserializeUser(function(id, next) {
    next(null, id);
});

app.use(passport.initialize());

passport.use(new TwitterStrategy({
    passReqToCallback: true,
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.APP_URL + "/auth/twitter/callback"
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

app.get('/', function(req, res) {
    // Render index.html and push montage.js
    Promise.all([
      readFile(PUBLIC_PATH + '/index.html'),
      readFile(PUBLIC_PATH + '/node_modules/montage/montage.js'),
    ]).then(function (files) {

      // Does the browser support push?
      if (res.push){

          // The JS file
          var montagePush = res.push('/node_modules/montage/montage.js', {
              req: {'accept': '**/*'},
              res: {'content-type': 'application/javascript'}
          });

          montagePush.on('error', function (err) {
              console.error(err);
          });

          montagePush.end(files[1]);
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
app.get('/api/twitter/:twitter_object/:twitter_action', function (req, res, next) {
 
  var accesToken = {
      token: req.query.token || req.headers['authorization-token'],
      secret: req.query.secret || req.headers['authorization-secret']
  };

  var client = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: accesToken.token,
      access_token_secret: accesToken.secret
  });
   
  var params = {};
  client.get(req.params.twitter_object + '/' + req.params.twitter_action, params, function(error, tweets, response) {
    if (error) {
        next(error);
    } else {
        res.json(tweets);
    }
  });
});

//
// Start http server
//

var options = {
    key: fs.readFileSync(ROOT_PATH + '/certs/server.key'),
    cert:  fs.readFileSync(ROOT_PATH + '/certs/server.crt')
};

spdy
  .createServer(options, app)
  .listen(process.env.APP_PORT, function (error) {
    if (error) {
      console.error(error);
      return process.exit(1);
    } else {
      console.log('Listening on port: ' + process.env.APP_PORT + '.');
    }
  });