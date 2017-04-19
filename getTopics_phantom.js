var fs = require('fs');
var page = require('webpage').create();
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.38 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36';
page.settings.webSecurityEnabled = false;
page.settings.resourceTimeout = 50000;
// page.viewportSize = { width: 1460, height: 4096 };

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.onResourceError = function(resourceError) {
    console.log('= onResourceError()');
    console.log('  - unable to load url: "' + resourceError.url + '"');
    console.log('  - error code: ' + resourceError.errorCode + ', description: ' + resourceError.errorString );
};

page.onError = function(msg, trace) {
    console.log('= onError()');
    var msgStack = ['  ERROR: ' + msg];
    if (trace) {
        msgStack.push('  TRACE:');
        trace.forEach(function(t) {
            msgStack.push('    -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    console.log(msgStack.join('\n'));
};

// Cookies needed to log in to Google and use AdWords
if (fs.exists('adWordsCookies.txt')) {
    console.log("Reading adWordsCookies file");
    var cookiesNetscape = fs.read('adWordsCookies.txt').split('\n');
    for(var i = 0; i < cookiesNetscape.length; i++) {
        var fields = cookiesNetscape[i].split('\t');

        if(fields.length > 7) {
            console.log("> 7 fields detected, check the format of the cookies file");
            phantom.exit(1);
        }

        var cookie = {
            domain: fields[0],
            flag: fields[1],
            path: fields[2],
            secure: fields[3],
            expiration: fields[4],
            name: fields[5],
            value: fields[6],
        };

        phantom.addCookie(cookie);
    }
} else {
    console.log("You need to have adWordsCookies.txt in the folder where this script is located.");
    phantom.exit(1);
}

// All the ad URL's we wan't to look up
var urls;

if (fs.exists('adEndpointUrls.txt')) {
    console.log("Reading adEndpointUrls file");
    urls = JSON.parse(fs.read('adEndpointUrls.txt'));
} else {
    console.log("You need to have adEndpointUrls.txt in the folder where this script is located.");
    phantom.exit(1);
}

function parseTopicsPage() {
    setTimeout(function () {
        var topics = page.evaluate(function() {
            var check = document.querySelector('#root > div.sm-c > div:nth-child(2) > div:nth-child(2) > div.ssb-b > div.ssb-f > div > div > div.ssb-a > div > div:nth-child(1) > div:nth-child(2) > div > div:nth-child(3) > div:nth-child(1) > div.smc-d');
            if (check.getAttribute('style') !== 'display: none;') {
                console.log("The url did not yield any topics");
                return;
            }

            var firstTopics = document.querySelector('#root > div.sm-c > div:nth-child(2) > div:nth-child(2) > div.ssb-b > div.ssb-f > div > div > div.ssb-a > div > div:nth-child(1) > div:nth-child(2) > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div.sRc-k > div:nth-child(3) > table.sib-z.sRc-j > tbody').childNodes[0].childNodes[0].childNodes[0].childNodes[0];
            var headTopics = firstTopics.childNodes[0].innerText;
            var allTopics = firstTopics.childNodes[1].title;
            console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<all");
            console.log(allTopics);

            return {'headTopics': headTopics, 'allTopics': allTopics};
        });

        page.render('adwords.png');
        phantom.exit();
        // return topics;
    }, 75000);
};

function getTopics(adEnpointUrls) {
    setTimeout(function () {
        page.evaluate(function(adEnpointUrls) {
            if (adEnpointUrls.length === 0) {
                console.log("No more urls to get topics for");
                return;
            }

            var nextUrl = adEnpointUrls.splice(0, 1);

            console.log("nextUrl");
            console.log(nextUrl);

            var divs = document.getElementsByTagName('div');
            var input;

            for(var i = 0; i < divs.length; i++) {
                if(divs[i].childNodes[0] != undefined) {
                    if(divs[i].childNodes[0].innerText == "Enter keywords, topics, or sites") {
                        divs[i].childNodes[1].value = nextUrl;
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
        }, adEnpointUrls);

        parseTopicsPage();
    }, 5000);
};

page.open('https://adwords.google.com/da/DisplayPlanner/Home?__c=2923577407&__u=2312169733&authuser=0&__o=cues#start', function(status) {
    console.log("status: " + status);
    getTopics(urls);
});

