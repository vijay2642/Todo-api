var express = require("express");
var app = express();
var port = process.env.PORT || 3000;

app.get('/', function(req,res) {
    res.send('Todo API  welcomes you!!!');
})

app.listen(port, function(req,res) {
    console.log("Express Todo web server started...");
})