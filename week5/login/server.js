var express = require('express');
var app = express();
var session = require('express-session');
var nedbstore = require('nedb-session-store')(session);

var multer=require('multer');
var upload = multer({dest:'public/uploads/'})

var bcrypt = require('bcrypt-nodejs');

var https = require('https');
var fs = require('fs'); // Using the filesystem module

var credentials = {
  key: fs.readFileSync('star_itp_io.key'),
  cert: fs.readFileSync('star_itp_io.pem')
};

var httpsServer = https.createServer(credentials, app);



// https://github.com/kelektiv/node-uuid
// npm install uuid
const uuid = require('uuid');

app.use(
	session(
		{
			secret: 'secret',
			cookie: {
				 maxAge: 365 * 24 * 60 * 60 * 1000   // e.g. 1 year
				},
			store: new nedbstore({
			 filename: 'sessions.db'
			})
		}
	)
);

app.use(express.static('public'));

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true }); // for parsing form data
app.use(urlencodedParser); 


// User database
var Datastore = require('nedb');
var db = new Datastore({ filename: 'users.db', autoload: true });

function generateHash(password) {
	return bcrypt.hashSync(password);
}

function compareHash(password, hash) {
    return bcrypt.compareSync(password, hash);
}

// Main page
app.get('/', function(req, res) {
	console.log(req.session.username);

	if (!req.session.username) {
		res.redirect('/login.html'); 
	} else {
		// Give them the main page
  		//res.send('session user-id: ' + req.session.userid + '. ');

		  var lastlogin = req.session.lastlogin;
		  var timeelapsed = Date.now() - lastlogin;
		  timeelapsed = timeelapsed / 1000;
			res.send("You were last here: " + Math.round(timeelapsed) + " seconds ago");
		//res.send(req.session);
	}
});

app.post('/register', upload.single('photo'), function(req, res) {
	console.log(req.file);


	// We want to "hash" the password so that it isn't stored in clear text in the database
	var passwordHash = generateHash(req.body.password);

	// The information we want to store
	var registration = {
		"username": req.body.username,
		"password": passwordHash
	};

	// Insert into the database
	db.insert(registration);
	console.log("inserted " + registration);
	
	// Give the user an option of what to do next
	res.send("Registered Sign In" );
	
});		

// Post from login page
app.post('/login', function(req, res) {

	// Check username and password in database
	db.findOne({"username": req.body.username},
		function(err, doc) {
			if (doc != null) {
				
				// Found user, check password				
				if (compareHash(req.body.password, doc.password)) {				
					// Set the session variable
					req.session.username = doc.username;

					// Put some other data in there
					req.session.lastlogin = Date.now();

					res.redirect('/');
					
				} else {

					res.send("Invalid Try again");

				}
			} 
		}
	);
	

});		

app.get('/logout', function(req, res) {
	delete req.session.username;
	res.redirect('/');
});

// Default HTTPS Port
//httpsServer.listen(443);
app.listen(8080);