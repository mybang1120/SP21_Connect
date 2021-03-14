var express = require('express');

// Require cookie-parser
var cookieParser = require('cookie-parser');

var app = express();

// Use the cookieParser middleware
app.use(cookieParser());

app.get('/', function (req, res) {
	// Log the cookies on the server side
	console.log(req.cookies);

	// Variable per request to keep track of visits
	var visits = 1;
	
	// If they have a "visits" cookie set, get the value and add 1 to it
	if (req.cookies.visits) {
		visits = Number(req.cookies.visits) + 1;
	}
	
	// Set the new or updated cookie
	res.cookie('visits', visits, {});
	
	// Send the info to the user
	res.send("You have visited this site " + visits + " times.");
});

app.listen(8080);		