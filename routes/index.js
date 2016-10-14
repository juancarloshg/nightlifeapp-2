var router = require('express').Router();
var User = require('../models/user.js');
var Bar = require('../models/bar.js');
var mid = require('../middleware');
var Yelp = require('yelp-v3');


router.get("/", function(req, res, next){
  res.render("index", {title: 'Welcome'});
});
// GET search page
router.get("/search/:search", function(req, res, next){

    // we get the search parameter
    if (req.params.search) {
        var yelp = new Yelp({
          access_token: process.env.YELP_TOKEN
        })

       yelp.search({ term: 'bar', location: req.params.search })
        .then(function (data) {
          if (!data.businesses[0]) {
            var error = new Error('We couldn\'t find any match for this location');
            error.status = 204;
            return next(error);
          }
          data.businesses.forEach(function(bar, index){
            Bar.findOne({ barId: bar.id})
            .exec(function(error, barDB){
              if (error) {
                //console.log(error)
              } else if (barDB) {
                bar.attending = barDB.attending;
              }
              if (index === data.businesses.length-1) res.render("index", {title: 'Welcome', bars: data.businesses});
            })
          })
        })
        .catch(function (err) {
           //console.error(err);
           var error = new Error('There was an error connecting to the database');
           error.status = 500;
           next(error);
        });
    } else {
      var err = new Error('You need to search for something!');
      err.status = 400;
      next(err);
    }
   
});

// POST /bar
router.post('/bar/:barId', mid.requiresLogin, function(req, res, next){
  Bar.findOne({ barId: req.params.barId})
        .exec(function(error, bar){
            if (error) {
              //console.log(error)
            } else if (!bar) {
              // crear bar y añadir usuario
              Bar.create({
                barId: req.params.barId,
                attending: [req.session.username]
              }), function (error, bar) {
                if (error) {
                  return next(error);
                } else {
                    return res.redirect('/')
                }
            }}
              else {
              if (bar.attending.indexOf(req.session.username) !== -1) {
                //borrar el usuario
                bar.attending.splice(bar.attending.indexOf(req.session.username),1)
                bar.markModified('attending');
                bar.save(function(err, updatedBar) {
                  if (err) {
                    var err = new Error("Couldn't delete you");
                    err.status = 404;
                    next(err)
                  }
                res.redirect('/')
                })
              } else {
                //añadir al usuario
                bar.attending.push(req.session.username)
                bar.markModified('attending');
                bar.save(function(err, updatedBar) {
                  if (err) {
                    var err = new Error("Couldn't add you");
                    err.status = 404;
                    next(err)
                  }
                res.redirect('/')
                })
              }
            }


  })
})

// POST /register
router.post('/register', mid.loggedOut, function(req, res, next) {
  if (req.body.username &&
  req.body.password &&
  req.body.confirmpass) {
    //Confirm passwords match
    if (req.body.password !== req.body.confirmpass) {
      var err = new Error('Passwords do not match');
      err.status = 400;
      return next(err);
    }
    //Create object with form input
    var userData = {
      username: req.body.username,
      password: req.body.password
    };

    // using schema's create method to insert document into mongo
    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.username = user.username;
        req.session.userId = user._id;
        return res.redirect('/')
      }
    });
  } else {
    var err = new Error('All fields required');
    err.status = 400;
    return next(err);
  }
});


// POST /login
router.post('/login', mid.loggedOut, function(req, res, next) {
  if (req.body.username && req.body.password) {
    User.authenticate(req.body.username, req.body.password, function(error, user) {
      if (error || !user) {
        var err = new Error('Wrong username or password');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        req.session.username = user.username;
        return res.redirect('/')
      }
    })
  } else {
    var err = new Error('Username and password are required');
    err.status = 401;
    return next(err);
  }
});


// GET /logout
router.get('/logout', mid.requiresLogin, function(req, res, next) {
  if (req.session) {
    //delete session object
    req.session.destroy(function(err){
      if (err) {
        return next(err);
      }
     else {
       res.redirect('/');
     }
    });
  }
});

module.exports = router;
