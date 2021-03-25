//node modules
var express = require('express');         // routing
var https = require('https');             // connecting to https
var fs = require('fs');                   // Using the filesystem module
var datastore = require('nedb');          // enbedding data
var bodyParser = require('body-parser');  // body parsing middleware
var session = require('express-session'); // creating a session middleware
var bcrypt = require('bcrypt-nodejs');    // hashing password
var nedbstore = require('nedb-session-store')(session); 
const uuid = require('uuid');             // creating random uuid

// make json files to store the data
var db = new datastore({filename: 'database.json', autoload: true});
var userdb = new datastore({filename: 'users.db', autoload: true});
var urlencoder = bodyParser.urlencoded({extended: true});

// using key & pem to connect to https
var credentials = {
  key: fs.readFileSync('star_itp_io.key'),
  cert: fs.readFileSync('star_itp_io.pem')
};

var app = express();
app.use(express.static('public'));
app.use(urlencoder);
app.set('view engine', 'ejs');         // using ejs template -> render


// store session data in db
app.use(
  session(
    {
      secret: 'secret',
      cookie: {
        maxAge: 365 * 24 * 60 * 60 * 1000  // store cookie data for 1 year max
      },
      store: new nedbstore({
        filename: 'session.db'             // store session data in db
      })
    }
  )
);

// hashing password
function generateHash(password){
  return bcrypt.hashSync(password);
}
function compareHash(password, hash){
  return bcrypt.compareSync(password, hash);
}


// default route depending on log-in status
app.get('/', function (req, res) {
  console.log(req.session.username);
  if(!req.session.username){
    res.redirect('/login.html');       // if not logged in, redirec to login page    
  }else{
    res.redirect('/map.html');     // if logged in
  }
});

// login route
var userId = null;
app.post('/login', function(req,res){
  userdb.findOne({"username":req.body.username},
  function(err,doc){
    // if user data exists, compare input user data with the doc
    if(doc != null){
      if(compareHash(req.body.password, doc.password)){
        req.session.username = doc.username;  //session starts
        userId = doc.username;
        res.redirect('/');
      }else{
        res.send("Invalid user ID or Password")
      }
    }
  })
})

// register route
app.post('/register', function(req,res){
  console.log(req.file);
  var passwordHash = generateHash(req.body.password);

  // make the given information to an object
  var registration ={
    "username": req.body.username,
    "password": passwordHash
  };

  // insert into the database
  userdb.insert(registration);
  console.log("inserted information: " + registration);

  res.redirect('/login.html');
});

// main page (map)
app.post('/map', function(req,res){
  var dataTosave = {
    userId: req.session.username ,
    place: req.body.place,
  }
  console.log(dataTosave);
  // insert the data to db
  db.insert(dataTosave, function(err, newDoc){
    db.find({userId: req.session.username}, function(err,docs){
      var wrapper = {data: docs};
      res.redirect('/display');
    });
    // res.redirect('/individuals.html');

  });
});

// show the personal record
app.get('/display', function(req,res){
  console.log("display");
  db.find({userId: req.session.username}, function(err, docs){   
      var dataWrapper = {data: docs};
      res.render("individuals.ejs", dataWrapper); 
  });
})

// logout
app.get('/logout', function(req,res){
  delete req.session.username;
  console.log("logged out");
  res.redirect('/login.html');              //go back to defaule route
})

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(443);
