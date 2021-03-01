var datastore=require('nedb');
var db = new datastore({filename:'database.json', autoload: true})

var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/formdata', function(req,res){
    let currentDate=new Date();
    let date=currentDate.getFullYear()+'-0'+(currentDate.getMonth()+1)+'-'+currentDate.getDate();
    console.log(date);

    var dataToSave={
        date: req.query.dateResult,
        emoji: req.query.emoji,
        text: req.query.text
    }
    console.log(dataToSave);
   db.insert(dataToSave,function(err,newDoc){
        //res.send("Data saved: "+newDoc);
        db.find({},function(err,docs){
            var wrapper ={data: docs};
           // res.render("outputtemplate.ejs", wrapper);
           res.send(docs);
        });
    });
})

app.listen(80,function(){
    console.log('Example app listening on port 80!')
}); 