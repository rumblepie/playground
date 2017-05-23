var fs = require('fs');
var utils = require('utils');
var casper = require('casper').create ({
    // logLevel: "debug",
    debug:true,
    waitTimeout: 15000,
    stepTimeout: 35000,
    verbose: true,
    viewportSize: {
        width: 1400,
        // height: 2048
        height: 1024
    },
    pageSettings: {
        // "userAgent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        "userAgent": 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.10 (KHTML, like Gecko) Chrome/23.0.1262.0 Safari/537.10',
        // "userAgent": 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/538.1 (KHTML, like Gecko) Safari/538.1',
        // "userAgent": 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/538.1 (KHTML, like Gecko) CasperJS/1.1.4+PhantomJS/2.1.1 Safari/538.1',
        // "userAgent": 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:53.0) Gecko/20100101 Firefox/53.0',
        // "loadImages": false,
        // "loadPlugins": false,
        // "localToRemoteUrlAccessEnabled": true,
        "webSecurityEnabled": false,
        "ignoreSslErrors": true
    },
    onWaitTimeout: function() {
        this.echo("A timeout occured through waitTimeout", "ERROR");
    },
    onStepTimeout: function() {
        // this.echo("A timeout occured through stepTimeout, clearing and page stopping", "ERROR");
        // this.echo("A timeout occured through stepTimeout, page stopping", "ERROR");
        this.echo("A timeout occured through stepTimeout", "ERROR");
        // this.clear();
        // this.page.stop();
    }
});

// casper.on('remote.message', function(msg) {
//     this.echo('remote message caught: ' + msg);
// });
// casper.options.onResourceRequested = function(C, requestData, request) {
//     utils.dump(requestData.headers);
// };

var cookiesFileName = casper.cli.get("cookies");
var baseUrlsAndTopic = casper.cli.get("bases");
var verify = casper.cli.get("verify");
var googleSearchPassword = casper.cli.get("pass");
var googleSearchLogin = casper.cli.get("user");
var profileData;

// if (!cookiesFileName) {
//     casper.echo("You need to supply the name of a cookies file like --cookies=<cookiesFileName>");
//     casper.exit(1);
// } else {
//     // // Cookies needed to log in to Google
//     if (fs.exists(cookiesFileName)) {
//         casper.echo("Reading " + cookiesFileName + " file");
//         // var cookies = fs.read("cookiesSavedByPhantomjs.txt");
//         // phantom.cookies = JSON.parse(cookies);
//         var cookiesNetscape = fs.read(cookiesFileName).split('\n');
//         for(var i = 0; i < cookiesNetscape.length; i++) {
//             var line = cookiesNetscape[i];
//             if (line.substring(0,1) === '#' || !line) {
//                 continue;
//             }
//
//             var fields = line.split('\t');
//
//             if(fields.length > 7) {
//                 casper.echo("> 7 fields detected, check the format of the cookies file");
//                 casper.exit(1);
//             }
//
//             var cookie = {
//                 domain: fields[0],
//                 flag: fields[1],
//                 path: fields[2],
//                 secure: fields[3],
//                 expiration: fields[4],
//                 name: fields[5],
//                 value: fields[6],
//             };
//
//             phantom.addCookie(cookie);
//         }
//     } else {
//         casper.echo("You need to have " + cookiesFileName + " in the folder where this script is located.");
//         casper.exit(1);
//     }
// }
if (!baseUrlsAndTopic) {
    casper.echo("You need to supply the name of a base urls file like --bases=<baseUrlsAndTopic>");
    casper.exit(1);
} else {
    if (fs.exists(baseUrlsAndTopic)) {
        casper.echo("Reading " + baseUrlsAndTopic + " file");
        profileData = JSON.parse(fs.read(baseUrlsAndTopic));
    } else {
        casper.echo("You need to have " + baseUrlsAndTopic + " in the folder where this script is located.");
        phantom.exit(1);
    }
}

var addZero = require("profileBuilderUtils").addZero;
var loginToGoogleAsync = require("loginToGoogleAsync");
var verifyActivityHistoryAsync = require("profileBuilderUtils").verifyActivityHistoryAsync;
var getGoogleLinks = require("profileBuilderUtils").getGoogleLinks;
var clickLinksAsync = require("profileBuilderUtils").clickLinksAsync;

var maxLinksClicked = 1;
var mid = 5000;
var date = new Date();

var records = {
    "start": date.getHours() + ":" + addZero(date.getMinutes()),
    "links": [],
    "searches": [],
    "googleLinks": [],
    "bases": []
};

casper.start('http://localhost:8000');

casper.then(function() {
    loginToGoogleAsync(this, googleSearchLogin, googleSearchPassword);
    this.then(function() {
        this.echo("Logged in to Google");
    });
});

casper.eachThen(profileData.urls, function(response){
    var baseUrl = response.data;
    var matchUrl = baseUrl.split("://")[1];
    var captureString = matchUrl.split(".")[0];
    var clickables;
    
    this.thenOpen(baseUrl, function() {
        this.echo("Base URL opened: " + baseUrl, "INFO");
        records.bases.push(baseUrl);
        this.capture("_preWait_" + captureString + "_first.png");
        this.wait(mid, function() {
            this.echo("Waited " + mid + " ms after opening base page");
            this.capture("_" + captureString + "_first.png");
        });
    });

    this.then(function() {
        clickables = this.evaluate(function() {
            var elements = __utils__.findAll('a');

            return elements.map(function(node) {
                return node.getAttribute('href');
            });
        });
    });

    this.then(function() {
        clickables = clickables.filter(function(elem) {
            return (elem.indexOf(matchUrl) > -1);
        });

        if (clickables.length < 1) {
            this.echo("Found no clickables, continuing with next base page");
            return;
        }

        clickLinksAsync(this, clickables, 0, maxLinksClicked, baseUrl, captureString, 0);

        this.thenOpen('http://www.google.com', function() {
            this.wait(mid, function() {
                this.echo("Waited " + mid + " ms after opening Google.com");
                this.capture("_google_base.png");
                // this.exit();
            });

            var q = "";

            this.then(function() {
                this.waitForSelector('form[action="/search"]', function() {
                    this.capture("_google_base.png");
                    q = matchUrl + " " + profileData.topic;
                    this.echo("q value: " + q);
                    this.fill('form[action="/search"]', { q: q }, true);
                });
            });

            this.then(function() {
                this.wait(mid, function() {
                    records.searches.push(q);
                    this.echo("Waited " + mid + " ms after submitting Google search form");
                    this.capture("_google_search_base_" + captureString + ".png");
                });
            });



            this.then(function() {
                var googleLinks = this.evaluate(getGoogleLinks);
                this.then(function() {
                    var validGoogleLinks = [];

                    if (googleLinks.length < 1) {
                        this.echo("Found no google links, continuing with next base page");
                        return;
                    }

                    for(var k = 0; k < googleLinks.length; k++) {
                        this.echo("Google link number " + k + ": " + googleLinks[k]);
                        var tmp = googleLinks[k].split('q=')[1];

                        if (tmp.indexOf(matchUrl) > -1) {
                            validGoogleLinks.push(googleLinks[k]);
                        }
                    }

                    var number = Math.floor(Math.random() * (validGoogleLinks.length - 0)) + 0;
                    var selector = "a[href=\"" + validGoogleLinks[number] + "\"]";

                    this.thenClick(selector, function() {
                        this.echo("Clicked on this link: " + validGoogleLinks[number] + " (number " + number + ")");
                        records.googleLinks.push(validGoogleLinks[number]);
                        this.capture("_google_link_preWait_" + captureString + "_"  + number + '.png');

                        this.wait(mid, function() {
                            this.echo("Waited " + mid + " ms after clicking on Google search link");
                            this.echo("Done");
                            this.capture("_google_link_" + captureString + "_"  + number + '.png');
                        });
                    });
                });
            });
        });
    });
});


// records = {
//     "start": "9:42",
//     "links": [
//         "http://iforsports.com/griezmann-reveals-only-club-that-he-would-leave-atletico-for-and-it-is-not-manchester-united/",
//         "https://sports.ndtv.com/indian-super-league",
//         "http://www.thesportreview.com/tsr/2017/05/latest-man-united-news-gary-neville-message-chelsea-spurs/",
//         "http://sportsgolive.com/rondon-hopes-ready-pitch-world-baseball-classic/",
//         "http://www.skysports.com/"
//     ],
//     "searches": [
//         "iforsports.com Sports",
//         "sports.ndtv.com Sports",
//         "thesportreview.com Sports",
//         "sportsgolive.com Sports",
//         "skysports.com Sports"
//     ],
//     "googleLinks": [
//         "/url?q=http://iforsports.com/author/tanishqdubey/&sa=U&ved=0ahUKEwjimYq3gIPUAhWSb1AKHXbLArIQFggnMAQ&usg=AFQjCNEnng3C4kRF3cs1ucYJHlvW_ARivQ",
//         "/url?q=https://sports.ndtv.com/tennis&sa=U&ved=0ahUKEwiG7cLMgIPUAhWKLFAKHYgsDGIQFggzMAM&usg=AFQjCNFL5U3OV9ErN_dnfwvlBGXAk0VbHg",
//         "/url?q=http://www.thesportreview.com/tsr/topics/chelsea/&sa=U&ved=0ahUKEwj-qoOOgYPUAhUHElAKHZ0YCmcQFgg2MAU&usg=AFQjCNHr5MvymcJo0l5k044FeBkeFjBVAQ",
//         "/url?q=http://sportsgolive.com/psl-2017-schedule/&sa=U&ved=0ahUKEwjH7ryIgoPUAhWBfFAKHfZ5DzoQFgg-MAg&usg=AFQjCNH1YEaVEmFssaXDe3vQuvtJv4Znug",
//         "/url?q=http://www.skysports.com/transfer-centre&sa=U&ved=0ahUKEwjawaLHgoPUAhVJKlAKHWTpC1sQFgg0MAQ&usg=AFQjCNGHNzKvoQBW6f_QCcM9EoQ6l5TM3w"
//     ],
//     "bases": [
//         "http://iforsports.com",
//         "http://iforsports.com",
//         "http://sports.ndtv.com",
//         "http://sports.ndtv.com",
//         "http://thesportreview.com",
//         "http://thesportreview.com",
//         "http://thesportreview.com",
//         "http://sportsgolive.com",
//         "http://sportsgolive.com",
//         "http://sportsgolive.com",
//         "http://skysports.com",
//         "http://skysports.com",
//         "http://skysports.com"
//     ],
//     "end": "9:54"
// };

casper.then(function() {
    date = new Date();
    records["end"] = date.getHours() + ":" + addZero(date.getMinutes());
    if (verify) {
        this.echo("Verifying history activity");
        verifyActivityHistoryAsync(this, records);
    }
});

casper.run(function(){
    this.exit();
});
