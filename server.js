/**
 * Created by sbo on 25-11-2016.
 */
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static('public'));

// Cookie inference
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/cookieInference.html'));
});

app.get('/timeit', function(req, res) {
    res.sendFile(path.join(__dirname + '/timeIt.html'));
});



app.post('/timeit', function(req, res) {
    console.log(JSON.stringify(req.body, null, 2));
});


app.get('/cachingPage', function(req, res) {
    res.sendFile(path.join(__dirname + '/cachingPage.html'));
});

// [
//     {
//         "basePage": "https://www.ethiojobs.net/display-job/134286/CMAM-Officer.html",
//         "farmerTopic": "Jobs & Education",
//         "resources": [
//             "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/7074369893259244581"
//         ],
//         "lpu": "http://kalkfrithjem.bwt.dk/brochure/",
//         "type": "targeted"
//     },
//     {
//         "basePage": "https://www.ethiojobs.net/display-job/134286/CMAM-Officer.html",
//         "farmerTopic": "Jobs & Education",
//         "resources": [
//             "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/4449122408996046725"
//         ],
//         "lpu": "http://www.vtapersolution.com/avoid",
//         "type": "targeted"
//     }
// ]
app.get('/adUrls', function(req, res) {
    fs.readFile(__dirname + '/files/_mostRecentAds.txt', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

app.get('/topics', function(req, res) {
    fs.readFile(__dirname + '/files/topics.txt', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
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