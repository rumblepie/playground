var fs = require('fs');

var casper = require('casper').create ({
    logLevel: "verbose",
    debug:true,
    waitTimeout: 10000,
    stepTimeout: 10000,
    verbose: true,
    viewportSize: {
        width: 1400,
        height: 768
    },
    pageSettings: {
        // "userAgent": 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.10 (KHTML, like Gecko) Chrome/23.0.1262.0 Safari/537.10',
        // "loadImages": false,
        // "loadPlugins": false,
        "webSecurityEnabled": false,
        "ignoreSslErrors": true
    },
    onWaitTimeout: function() {
        this.echo("A timeout occured through waitTimeout", "ERROR");
    },
    onStepTimeout: function() {
        this.echo("A timeout occured through stepTimeout", "ERROR");
    }
});

casper.on('remote.message', function(msg) {
    this.echo('remote message caught: ' + msg);
});

// 1. Take in list of urls and their associated topic
var profileData;

if (fs.exists('buildProfile1.txt')) {
    console.log("Reading buildProfile1 file");
    profileData = JSON.parse(fs.read('buildProfile1.txt'));
} else {
    console.log("You need to have buildProfile1.txt in the folder where this script is located.");
    phantom.exit(1);
}

casper.start('http://localhost:8000');

// Helper function
function getLinks() {
    var links = document.querySelectorAll('h3.r a');
    return Array.prototype.map.call(links, function(e) {
        return e.getAttribute('href');
    });
}

var preData = {};
var counter = 0;
var maxLinksClicked = 2;

// 2. Visit urls and get their href tags
casper.eachThen(profileData.urls, function(response){
    var startUrl = response.data;
    var matchUrl = startUrl.split("://")[1];
    var clickables;

    this.thenOpen(startUrl, function() {
        this.echo("Base URL: " + startUrl, "INFO");
        this.capture('0initial.png');
    }).then(function() {
        clickables = this.evaluate(function() {
            var elements = __utils__.findAll('a');

            return elements.map(function(node) {
                return node.getAttribute('href');
            });
        });
    }).then(function() {
        preData[startUrl] = {};
        preData[startUrl]["matchUrl"] = matchUrl;
        preData[startUrl]["clickables"] = clickables.filter(function(elem) {
            return (elem.indexOf(matchUrl) > -1);
        });
    });
});


// Visit urls and click up to 10 links
casper.then(function() {
    this.eachThen(Object.keys(preData), function(response) {
        counter = 0;
        var link = response.data;
        var links = preData[link].clickables;
        this.echo("Link: " + link);

        this.open(link);

        this.then(function() {
            this.eachThen(links, function(responseInner) {
                if (counter === maxLinksClicked) {
                    this.echo("Clicked " + maxLinksClicked + " links, continuing with the next base page");
                    return;
                }

                var number = Math.floor(Math.random() * (links.length - 0 + 1)) + 0;
                var toBeClicked = links[number];

                if (typeof toBeClicked == 'undefined') {
                    this.echo("========================Found undefined");
                    return;
                }

                this.echo("Current click counter: " + counter);
                this.echo("Clicking " + toBeClicked + " (number " + number + ")");
                var selector = "a[href=\"" + toBeClicked + "\"]";

                this.waitForSelector(
                    selector,
                    function wfsThen() {
                        this.thenClick(selector, function(){
                            this.waitForUrl(
                                toBeClicked,
                                function wfuThen() {
                                    this.echo("New url: " + this.getCurrentUrl());
                                    this.capture(counter + '.png');
                                    counter = counter + 1;
                                },
                                function wfuTimeout() {
                                    this.echo("This url: <<<" + toBeClicked + ">>> did not load in time");
                                },
                                5000
                            );
                        });
                    },
                    function wfsTimeout() {
                        this.echo("This selector: <<<" + selector + ">>> did not load in time");
                    },
                    5000
                );
            });

            this.thenOpen('http://google.com', function() {
                this.waitForSelector('form[action="/search"]', function() {
                    var q = preData[link].matchUrl + " " + profileData.topic;
                    this.echo("q value: " + q);
                    this.fill('form[action="/search"]', { q: q }, true);
                });
            });

            this.then(function() {
                var googleLinks = this.evaluate(getLinks);
                this.then(function() {
                    var validGoogleLinks = [];

                    this.echo("Found " + googleLinks.length + " Google links");
                    for(var k = 0; k < googleLinks.length; k++) {
                        this.echo("Google link number " + k + ": " + googleLinks[k]);
                        var tmp = googleLinks[k].split('q=')[1];

                        if (tmp.indexOf(preData[link].matchUrl) > -1) {
                            validGoogleLinks.push(googleLinks[k]);
                        }
                    }

                    var number = Math.floor(Math.random() * (validGoogleLinks.length - 0 + 1)) + 0;

                    this.echo("Clicking on this link: " + validGoogleLinks[number] + " (number " + number + ")");

                    var selector = "a[href=\"" + validGoogleLinks[number] + "\"]";

                    this.thenClick(selector, function() {
                        this.echo("Done");
                        this.capture(counter + "_google" + '.png');
                    });
                });
            });
        });
    });
});

// 7. return the generated DoubleClick cookie

casper.run(function(){
    this.exit();
});