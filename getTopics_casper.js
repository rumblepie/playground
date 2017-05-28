var fs = require('fs');
var utils = require('utils');

var casper = require('casper').create ({
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
        "userAgent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        "loadImages": false,
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

var readCookies = require("commonUtils").readCookies;
var cookies = casper.cli.get("cookies");
readCookies(casper, cookies);
var endpointFileName = casper.cli.get("endpoints");
var endpoints;

var adWordsUrl = 'https://adwords.google.com/da/DisplayPlanner/Home?__c=2923577407&__u=2312169733&authuser=0&__o=cues#start';
var initSelector = '#root > div.sm-c > div:nth-child(2) > div > div.sn-e.sn-b > div > div.sx-c';


if (fs.exists(endpointFileName)) {
    console.log("Reading endpoints file");
    endpoints = JSON.parse(fs.read(endpointFileName));
} else {
    console.log("You need to supply a file with the endpoints to get topics for");
    casper.exit(1);
}

function parseTopicsPage(self) {
    return self.evaluate(function() {
        var check = document.querySelector('#root > div.sm-c > div:nth-child(2) > div:nth-child(2) > div.ssb-b > div.ssb-f > div > div > div.ssb-a > div > div:nth-child(1) > div:nth-child(2) > div > div:nth-child(3) > div:nth-child(1) > div.smc-d');
        if (check.getAttribute('style') !== 'display: none;') {
            console.log("The url did not yield any topics");
            return;
        }

        var firstTopics = document.querySelector('#root > div.sm-c > div:nth-child(2) > div:nth-child(2) > div.ssb-b > div.ssb-f > div > div > div.ssb-a > div > div:nth-child(1) > div:nth-child(2) > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div.sRc-k > div:nth-child(3) > table.sib-z.sRc-j > tbody').childNodes[0].childNodes[0].childNodes[0].childNodes[0];
        var headTopics = firstTopics.childNodes[0].innerText;
        var allTopics = firstTopics.childNodes[1].title;

        return {'headTopics': headTopics, 'allTopics': allTopics};
    });
};

function fillInputAndClick(self, endpoint) {
    self.evaluate(function(endpoint) {
        var divs = document.getElementsByTagName('div');
        var input;

        for(var i = 0; i < divs.length; i++) {
            if(divs[i].childNodes[0] != undefined) {
                if(divs[i].childNodes[0].innerText == "Enter keywords, topics, or sites") {
                    divs[i].childNodes[1].value = endpoint;
                    input = divs[i].childNodes[1];
                    break;
                }
            }
        }

        var event = document.createEvent('Event');
        event.initEvent('keyup', true, true);
        event.keyCode = 76;
        input.dispatchEvent(event);

        var buttons = document.getElementsByTagName('button');

        for(var i = 0; i < buttons.length; i++) {
            if(buttons[i].childNodes.length > 0) {
                if(buttons[i].childNodes[0].innerText != undefined) {
                    if(buttons[i].childNodes[0].innerText == 'Get ad group ideas') {
                        buttons[i].click();
                    }
                }
            }

        }
    }, endpoint);
}

function getTopics(self, endpoint) {
    self.then(function() {
        fillInputAndClick(self, endpoint);
    });

    self.then(function() {
        self.wait(8000, function() {
            self.capture('renderings/adwords2.png');
        });
    });

    self.then(function() {
        var topics = parseTopicsPage(self);
        self.then(function() {
            fs.write('files/topics_' + endpoint + '_' + Date.now() + '.txt', JSON.stringify(topics, null, 2), 'w');
        });
    });

};

casper.start('http://localhost:8000', function(status) {});

casper.eachThen(endpoints, function(response) {
    var endpoint = response.data;

    this.then(function() {
        this.clear();
    });

    this.then(function() {
        this.echo('Current endpoint: ' + endpoint);
        this.thenOpen(adWordsUrl, function() {
            this.waitForSelector(
                initSelector,
                function then() {
                    this.capture('renderings/adwords1.png');
                    getTopics(this, endpoint);
                },
                function onTimeout() {
                    this.echo('Initial opening of adwords timed out');
                },
                10000
            );
        });
    });
});

casper.run(function() {
    this.exit();
});
