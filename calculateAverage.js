/**
 * Created by sbo on 26-11-2016.
 */
var path = require('path');
var fs = require('fs');
var readline = require('readline');

var lineReader = readline.createInterface({
    input: fs.createReadStream(path.join(__dirname + '/withCookie.txt'))
});

var lineReader2 = readline.createInterface({
    input: fs.createReadStream(path.join(__dirname + '/withoutCookie.txt'))
});

var withCookieAvg = 0;
var counter = 0;

var withoutCookieAvg = 0;
var counter2 = 0;

lineReader.on('line', function (line) {
    if(line != '') {
        withCookieAvg = withCookieAvg + parseFloat(line.split(" ")[0]);
        counter = counter + 1;
    }
});

lineReader.on('close', function (line) {
    console.log("Average time with cookie:");
    console.log(withCookieAvg / counter);
});

lineReader2.on('line', function (line) {
    if(line != '') {
        withoutCookieAvg = withoutCookieAvg + parseFloat(line.split(" ")[0]);
        counter2 = counter2 + 1;
    }
});

lineReader2.on('close', function(){
    console.log("Average time without cookie:");
    console.log(withoutCookieAvg / counter2);
});