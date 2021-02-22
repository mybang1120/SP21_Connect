var datastore=require('nedb');
var db = new datastore({filename:'database.json', autoload: true})

var express = require('express');
var app = express();
var bodyParser=require('body-parser');

var urlencoder=bodyParser.urlencoded({extended: true});
app.use(urlencoder);

app.use(express.static('public'));

app.set('view engine', 'ejs');

//defaul route -> '/'
/*
app.get('/', function (req,res){
    res.send('Hello World!')
});*/

var submittedData=[];

app.get('/displayrecord', function(req,res){
    db.find({_id: req.query._id}, function(err, docs){
        var dataWrapper ={data:docs[0]};
        res.render("individual.ejs", dataWrapper);
    });
})

app.get('/search', function (req,res){
var query= new RegExp(req.query.q, 'i');

    // -> /search?q=text to search for
    console.log("search for: "+req.query.q);
    db.find({date: query}, function(err,docs){
        var dataWrapper={data: docs};
        res.render("outputtemplate.ejs", dataWrapper);
    })
});

app.post('/formdata', function(req,res){
    //console.log(req.query.data);
    //res.send("*got your data* : "+ req.query.data);

    //console.log(req.body.data);
    /*
    var dataToSave = new Object();
    dataToSave.text=req.body.data;
    dataToSave.color=req.body.color;
    */
    let currentDate=new Date();
    let date=currentDate.getFullYear()+'-0'+(currentDate.getMonth()+1)+'-'+currentDate.getDate();

    var dataToSave={
        date: req.body.cal,
        emoji: req.body.emoji,
        color: req.body.color,
        longtext: req.body.longtext
    }
    console.log(dataToSave);
   db.insert(dataToSave,function(err,newDoc){
        //res.send("Data saved: "+newDoc);
        db.find({},function(err,docs){
            var wrapper ={data: docs};
            res.render("outputtemplate.ejs", wrapper);
        });
    });
})

app.listen(80,function(){
    console.log('Example app listening on port 80!')
}); 