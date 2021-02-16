var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var urlencodedParser = bodyParser.urlencoded({extended: true});
app.use(urlencodedParser);

app.use(express.static('public'));

var submittedData = [];

app.get('/', function(req,res){
    res.send('Hello World!');
});

app.post('/formdata', function (req,res){
    //console.log(req.query.data);
    //res.send("Got you data! You submitted: "+req.query.data);
    console.log(req.body.data);

    /*
    var dataToSave = new Object();
    DataToSave.text = req.body.data;
    dataToSave.color = req.body.color;
    */
    var dataToSave ={
        emoji: req.body.emojis,
        color: req.body.color,
        size: req.body.size,
    };

    submittedData.push(dataToSave);

    //console.log(dataToSave);
    console.log(submittedData);

    var output = "<html><body>";

    for(var i = 0; i<submittedData.length; i++){
        var posX = Math.floor(Math.random() * Math.floor(100-submittedData[i].size));
        var posY = Math.floor(Math.random() * Math.floor(100-submittedData[i].size));
        console.log(posX+"/"+posY);
        output+= "<div style='background-color: "+submittedData[i].color+"; font-family: helvetica; position: absolute; text-align:center; font-size:"+submittedData[i].size+"vw; top: "+posY+"vh; "+"left: "+posX+"vw;'>"+submittedData[i].emoji+"</div>";
    }

    output += "</body></html>";
    res.send(output);
});

app.listen(80, function(){
    console.log('Example app listening on port 80!');
});