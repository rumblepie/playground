/**
 * Created by sbo on 25-11-2016.
 */
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');


// Cookie inference
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/cookieInference.html'));
});

app.get('/save', function(req, res) {
    var toBeWritten;
    if(req.query.isCookie == '1') {
        toBeWritten = req.query.time + " with cookie\n"
        fs.appendFile('withCookie.txt', toBeWritten, function (err) {
            if(err) throw err;
            return;
        });
    } else {
        toBeWritten = req.query.time + " without cookie\n"
        fs.appendFile('withoutCookie.txt', toBeWritten, function (err) {
            if(err) throw err;
            return;
        });
    }

});


// Some name here
app.get('/some', function(req, res) {
    res.sendFile(path.join(__dirname + '/webpage.html'));
});


console.log("Server listening on port 3000");

app.listen(3000);