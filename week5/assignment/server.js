var datastore=require('nedb');
var db = new datastore({filename:'database.json', autoload: true})
var userdb = new datastore({ filename: 'users.db', autoload: true });

var express = require('express');
var bodyParser=require('body-parser');
var https = require('https');
var fs = require('fs');

var app = express();

var session=require('express-session');
var nedbstore=require('nedb-session-store')(session);

var multer = require('multer');
var upload = multer({dest: 'public/uploads'});
var bcrypt = require('bcrypt-nodejs');

var urlencoder=bodyParser.urlencoded({extended: true});
app.use(urlencoder);

app.use(express.static('public'));

app.set('view engine', 'ejs');

var credentials = {
  key: fs.readFileSync('star_itp_io.key'),
  cert: fs.readFileSync('star_itp_io.pem')
};
var httpsServer = https.createServer(credentials, app);
const uuid = require('uuid');

app.use(
  session(
    {
      secret: 'secret',
      cookie: {
        maxAge: 365 * 24 * 60 * 60 * 1000
      },
      store: new nedbstore({
        filename: 'session.db'
      })
    }
  )
)

function generateHash(password){
  return bcrypt.hashSync(password);
}
function compareHash(password,hash){
  return bcrypt.compareSync(password, hash);
}

app.get('/', function(req, res) {
	console.log(req.session.username);

	if (!req.session.username) {
		res.redirect('/login.html'); 

	} else {
		// Give them the main page
  		//res.send('session user-id: ' + req.session.userid + '. ')
      res.redirect('/journal.html')
	}
});

app.post('/register', function(req, res) {
	console.log(req.file);
	// We want to "hash" the password so that it isn't stored in clear text in the database
	var passwordHash = generateHash(req.body.password);

	// The information we want to store
	var registration = {
		"username": req.body.username,
		"password": passwordHash
	};

	// Insert into the database
	userdb.insert(registration);
	console.log("inserted " + registration);
	
	// Give the user an option of what to do next
	res.redirect('/login.html');
	
});		

var userId= null;

app.post('/login', function(req,res){
  userdb.findOne({"username":req.body.username},
  function(err, doc){
    if(doc != null){
      if(compareHash(req.body.password, doc.password)){
        req.session.username = doc.username;
        userId = doc.username;
        res.redirect('/');
      }else{
        res.send("Invalid Try again")
      }
    }
  })
})
var submittedData=[];

app.post('/formdata', upload.single('photo'),function(req,res){
    let currentDate=new Date();
    let date=currentDate.getFullYear()+'-0'+(currentDate.getMonth()+1)+'-'+currentDate.getDate();

    var dataToSave={
        userId: userId,
        file:req.file,
        date: req.body.cal,
        emoji: req.body.emoji,
        longtext: req.body.longtext
    }
    console.log(dataToSave);
   db.insert(dataToSave,function(err,newDoc){
        db.find({userId: req.session.username},function(err,docs){
            var wrapper ={data: docs};
            res.render("outputtemplate.ejs", wrapper);
        });
    });
})


app.get('/displayrecord',  function(req,res){
  db.find({_id: req.query._id}, function(err, docs){
      var dataWrapper ={data:docs[0]};
      res.render("individual.ejs", dataWrapper);
  });
})
app.get('/logout', function(req, res) {
	delete req.session.username;
	res.redirect('/');
});

httpsServer.listen(443);