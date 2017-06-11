var self = require('casper');

var casper = require('casper').create({
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
        "userAgent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        // "userAgent": 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.10 (KHTML, like Gecko) Chrome/23.0.1262.0 Safari/537.10',
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

// Helpful debugging settings
casper.on('remote.message', function(msg) {
    this.echo('Page console: ' + msg);
});

casper.on("page.error", function(msg, trace) {
    this.echo("Page error: " + msg, "ERROR");
});

// External
var fs = require('fs');
var utils = require('utils');
var x = require('casper').selectXPath;

// Internal
var getAds = require("commonUtils").getAds;
var findAd = require("commonUtils").findAd;
var addZero = require("profileBuilderUtils").addZero;
var loginToGoogleAsync = require("loginToGoogleAsync").loginToGoogleAsync;
var verifyActivityHistoryAsync = require("profileBuilderUtils").verifyActivityHistoryAsync;
var clickLinksAsync = require("profileBuilderUtils").clickLinksAsync;
var searchGoogleAndFollowLinkAsync = require("profileBuilderUtils").searchGoogleAndFollowLinkAsync;
var getTopics = require('getTopics').getTopics;
var readCookies = require('commonUtils').readCookies;
var squashRecords = require('commonUtils').squashRecords;
var buildProfileAsync = require('buildProfileAsync').buildProfileAsync;
var filterAdvertisement = require('filterAdvertisement').filterAdvertisement;
var filterAdRecords = require('filterAdvertisement').filterAdRecords;

// CLI checks
var profiles = casper.cli.get('profiles');
if (!profiles) {
    casper.echo('You must supply a --profile');
    casper.exit(1);
} else {
    if (!fs.exists(profiles)) {
        casper.echo('Could not find the profiles file');
        casper.exit(1);
    }

    profiles = JSON.parse(fs.read(profiles));
}




var __topics;
var __ads;
var __numAds;
var __records;
var __matchesAndDifference;

casper.start('http://localhost:7777');

casper.then(function() {
    var prof = profiles.filter(function(elem) {
         // return elem.email === 'crescente.pisano@lab.imtlucca.it';
         return elem.email === 'simontravel500@gmail.com';
         // return elem.email === 'kildevaeld500@gmail.com';
    });

    var self = this;

    buildProfileAsync(this, prof[0], 5, false, function(records, matchesAndDifference) {
        __records = records;
        __records.adRecords = squashRecords(__records.adRecords);
        __matchesAndDifference = matchesAndDifference;
    });

    var testRecords = {
        "start": "18:34",
        "links": [
            "https://www.ethiojobs.net/browse-by-category/Veterinary%20Services/",
            "https://www.ethiojobs.net/find-jobs-in-ethiopia/Oromia/",
            "https://www.ethiojobs.net/employers/",
            "https://www.ethiojobs.net/job-alerts/"
        ],
        "searches": [
            "ethiojobs.net Jobs & Education"
        ],
        "googleLinks": [
            "http://www.ethiojobs.net/display-job/44005/Education-Facilitator.html"
        ],
        "bases": [
            "http://ethiojobs.net",
            "http://ethiojobs.net",
            "http://ethiojobs.net",
            "http://ethiojobs.net"
        ],
        "end": "18:39",
        "adRecords": {
            "keys": [
                "http://www.banknorwegian.dk/Kreditkort",
                "http://www.danmark.date/campaign",
                "https://business.linkedin.com/sales-solutions/cx/16/01/request-demo-sem",
                "http://www.russiamatches.com/go.php"
            ],
            "http://www.banknorwegian.dk/Kreditkort": {
                "basePage": "https://www.ethiojobs.net/browse-by-category/Veterinary%20Services/",
                "farmerTopic": "Jobs & Education",
                "resources": [
                    "https:\\/\\/tpc.googlesyndication.com\\/daca_images\\/simgad\\/1263894042562448091"
                ],
                "lpu": "http://www.banknorwegian.dk/Kreditkort"
            },
            "http://www.danmark.date/campaign": {
                "basePage": "https://www.ethiojobs.net/find-jobs-in-ethiopia/Oromia/",
                "farmerTopic": "Jobs & Education",
                "resources": [
                    "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/18077008196975770224"
                ],
                "lpu": "http://www.danmark.date/campaign"
            },
            "https://business.linkedin.com/sales-solutions/cx/16/01/request-demo-sem": {
                "basePage": "https://www.ethiojobs.net/find-jobs-in-ethiopia/Oromia/",
                "farmerTopic": "Jobs & Education",
                "resources": [
                    "https:\\/\\/tpc.googlesyndication.com\\/daca_images\\/simgad\\/5823642904699370402"
                ],
                "lpu": "https://business.linkedin.com/sales-solutions/cx/16/01/request-demo-sem"
            },
            "http://www.russiamatches.com/go.php": {
                "basePage": "http://www.ethiojobs.net/display-job/44005/Education-Facilitator.html",
                "farmerTopic": "Jobs & Education",
                "resources": [
                    "https:\\/\\/tpc.googlesyndication.com\\/daca_images\\/simgad\\/16913216721130494142"
                ],
                "lpu": "http://www.russiamatches.com/go.php"
            }
        },
        "farmerTopic": "Jobs & Education"
    };

    this.then(function() {
        this.echo(JSON.stringify(__records, null, 2));
        this.echo('Filtering advertisements');
        var self = this;
        // filterAdRecords(this, testRecords.adRecords, function(result) {
        filterAdRecords(this, __records.adRecords, function(result) {
            self.echo('filtered advertisements: ');
            self.echo(JSON.stringify(result, null, 2));
            fs.write('files/' + Date.now() + '_' + prof[0].email + '_ads.txt', JSON.stringify(result, null, 2), 'w');
            fs.write('files/_mostRecentAds.txt', JSON.stringify(result, null, 2), 'w');
            self.then(function() {
                self.exit(0);
            });
        });
    });



    // this.then(function() {
    //     this.echo('Got the following matches and differences: ');
    //     this.echo(JSON.stringify(__matchesAndDifference, null, 2));
    //     this.echo("");
    //     this.echo("");
    //     this.echo("");
    //     this.echo("");
    //     this.echo("");
    //     this.echo("");
    //     this.echo("");
    //     this.echo('Got the following record: ');
    //     this.echo(JSON.stringify(__records, null, 2));
    // });
});

// casper.then(function() {
//     // getTopics(this, 'https://eqagqegadvaedgfaegegfasdggqegqegqg.com', true, function(topics) {
//     getTopics(this, 'http://www.russiamatches.com/go.php', true, function(topics) {
//         __topics = topics;
//     });
//     this.then(function() {
//         this.echo('Got the following topics: ');
//         this.echo(JSON.stringify(__topics, null, 2));
//     });
// });

// casper.then(function() {
//     // this.thenOpen('http://eb.dk', function() {
//     this.thenOpen('http://sports.ndtv.com', function() {
//         this.wait(15000);
//     });
//     this.then(function() {
//         this.capture('renderings/ads.png');
//         __ads = this.evaluate(getAds, null, true, 0, null);
//         this.echo('Got the following ads: ');
//         this.echo(JSON.stringify(__ads, null, 2));
//         this.then(function() {
//             if (__ads.ads.length > 0) {
//                 this.echo('finding ads');
//                 findAd(this, __ads.ads[0], __ads.basePage, 0, 0, function(num) {
//                     __numAds = num;
//                 });
//                 this.then(function() {
//                     this.echo('Got the following number of ads: ' + __numAds);
//                 });
//             } else {
//                 this.echo('Found no ads');
//             }
//
//         });
//     });
// });

// casper.then(function() {
//     this.thenOpen('http://sports.ndtv.com', function() {
//         this.wait(8000);
//     });
//     this.then(function() {
//         // var testUcr = 'https://tpc.googlesyndication.com/simgad/9975285276584498712?w=600&amp;h=314';
//     });
// });

casper.run(function() {
    this.exit();
});


