function init(self) {
    if (typeof readCookies === 'undefined') {
        self.echo("Could not find readCookies function");
        self.exit(1);
    }

    var adWordsCookieFileName = self.cli.get("adWordsCookie");
    if(!adWordsCookieFileName) {
        self.echo("You need to supply --adWordsCookie");
        self.exit(1);
    } else {
        readCookies(self, adWordsCookieFileName);
    }
}

function parseTopicsPage(self) {
    return self.evaluate(function() {
        var check = document.querySelector('#root > div.sm-c > div:nth-child(2) > div:nth-child(2) > div.ssb-b > div.ssb-f > div > div > div.ssb-a > div > div:nth-child(1) > div:nth-child(2) > div > div:nth-child(3) > div:nth-child(1) > div.smc-d');
        if (check.getAttribute('style') !== 'display: none;') {
            console.log("The url did not yield any topics");
            return null;
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
                    divs[i].childNodes[1].setAttribute('sboInputAtt', 'sboInputAttVal');
                    break;
                }
            }
        }
        // var event = document.createEvent('Event');
        // event.initEvent('keyup', true, true);
        // input.dispatchEvent(event);

        var event2 = document.createEvent('Event');
        event2.initEvent('keydown', true, true);
        event2.keyCode = 9;
        input.dispatchEvent(event2);

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

    // self.then(function() {
    //     self.sendKeys(
    //         'input[class]',
    //         endpoint,
    //         {
    //             keepFocus: true,
    //         }
    //     );
    // });
    //
    // self.then(function() {
    //     self.capture('renderings/adwords3.png');
    // });

    // self.then(function() {
    //     self.evaluate(function() {
    //         var event = document.createEvent('Event');
    //         event.initEvent('keyup', true, true);
    //         input.dispatchEvent(event);
    //
    //         // var event2 = document.createEvent('Event');
    //         // event2.keyCode = 13;
    //         // input.dispatchEvent(event);
    //
    //         var buttons = document.getElementsByTagName('button');
    //
    //         for(var i = 0; i < buttons.length; i++) {
    //             if(buttons[i].childNodes.length > 0) {
    //                 if(buttons[i].childNodes[0].innerText != undefined) {
    //                     if(buttons[i].childNodes[0].innerText == 'Get ad group ideas') {
    //                         buttons[i].click();
    //                     }
    //                 }
    //             }
    //
    //         }
    //     });
    // });
}

//TODO: Sometimes timeouts seem to break this function
//TODO: This happened when the cookie was no good. It might be that a login is needed instead of cookie uses.
function getTopics(self, endpoint, start, cb) {
    if(start) {
        init(self);
    } else {
        self.clear();
    }

    var adWordsUrl = 'https://adwords.google.com/da/DisplayPlanner/Home?__c=2923577407&__u=2312169733&authuser=0&__o=cues#start';
    var initSelector = '#root > div.sm-c > div:nth-child(2) > div > div.sn-e.sn-b > div > div.sx-c';

    self.thenOpen(adWordsUrl, function() {
        self.capture('renderings/adwords0.png');
    });

    self.then(function() {
        self.echo('Getting topics for: ' + endpoint);
        self.waitForSelector(
            initSelector,
            function then() {
                self.capture('renderings/adwords1.png');
            },
            function onTimeout() {
                //TODO: this usually means the adwords cookie is invalid, needs new each day.
                self.echo('Timed out, is adwords cookie valid?');
                self.exit();
            },
            10000
        );
    });

    self.then(function() {
        //TODO: In the screenshots the urls are declared as keywords, maybe
        //TODO: find a way to make them declared as URLS?
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
            cb(topics);
        });
    });
};

module.exports.getTopics = getTopics;
