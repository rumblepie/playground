var fs = require('fs');
var utils = require('utils');

var casper = require('casper').create ({
    // logLevel: "debug",
    debug:true,
    waitTimeout: 15000,
    stepTimeout: 15000,
    verbose: true,
    viewportSize: {
        width: 1400,
        height: 1024
    },
    exitOnError: false,
    pageSettings: {
        // "userAgent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        //"userAgent": 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.10 (KHTML, like Gecko) Chrome/23.0.1262.0 Safari/537.10',
        // "userAgent": 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/538.1 (KHTML, like Gecko) Safari/538.1',
        // "userAgent": 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/538.1 (KHTML, like Gecko) CasperJS/1.1.4+PhantomJS/2.1.1 Safari/538.1',
        // "userAgent": 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:53.0) Gecko/20100101 Firefox/53.0',
        "loadImages": true,
        "webSecurityEnabled": false,
        "ignoreSslErrors": true
    },
    onWaitTimeout: function() {
        this.echo("A timeout occured through waitTimeout");
    },
    onStepTimeout: function() {
        this.echo("A timeout occured through stepTimeout");
    }
});

casper.on('remote.message', function(msg) {
    this.echo('remote message caught: ' + msg);
});

casper.on("page.error", function(msg, trace) {
    this.echo("Error: " + msg, "ERROR");
});

var loginToGoogleAsync = require("loginToGoogleAsync");
var readCookies = require("commonUtils").readCookies;
var goThroughIframes = require("commonUtils").goThroughIframes;

var googleSearchPassword = casper.cli.get("pass");
var googleSearchLogin = casper.cli.get("user");
var cookies = casper.cli.get("cookies");

casper.start('http://localhost:8000');

casper.then(function() {
    if(googleSearchPassword && googleSearchLogin) {
        loginToGoogleAsync(this, googleSearchLogin, googleSearchPassword);
        this.then(function() {
            this.echo("Logged in to Google");
        });
    }

    // if(cookies) {
    //     readCookies(this, cookies);
    //     this.then(function() {
    //         this.echo("Imported cookies");
    //     });
    // }
    // var cookies = JSON.parse(fs.read('renderings/monadscookie.txt'));
    // for(var i = 0; i < cookies.length; i++) {
    //     phantom.addCookie(cookies[i]);
    // }
});



var toOpen = "http://sports.ndtv.com";
// var toOpen = "http://www.monadsproject.com";
// var toOpen = "http://www.google.com";
var openWait = 8000;

casper.then(function() {
    this.thenOpen(toOpen, function() {
        if(this.getCurrentUrl() === 'http://www.monadsproject.com/about.html') {
            this.echo("Clicking on proceed button");
            this.evaluate(function() {
                document.querySelector('button[onclick="proceed_funct()"]').click();
            });
        }
    });
});

casper.then(function() {
    this.wait(openWait, function() {
        fs.write('renderings/monadscookie.txt', JSON.stringify(phantom.cookies), 'w');
        this.echo("Opened " + toOpen);
        this.capture('renderings/page.png');
    });
});

casper.then(function() {
    var result = {
        'ads': [],
        'basePage': ''
    };
    var ads = this.evaluate(goThroughIframes, null, true, 0, null);
    this.then(function() {
        fs.write('files/ads_' + Date.now() + '.txt', JSON.stringify(ads, null, 2), 'w');
    });
});

casper.run(function() {
    this.exit();
});
