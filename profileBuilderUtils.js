var addZero = function(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
};

var mid = 10000;
var date = new Date();

var getRecentAcitivtyEntriesAsync = function(self, recentActivity, records) {
    var numberOfBundleButtons;
    self.then(function() {
        numberOfBundleButtons = self.evaluate(function() {
            var blocks = document.querySelectorAll("div.fp-bundle-date-block-holder");

            var blockDateSelector = "div.fp-date-block-date-holder > h2.t08.fp-date-block-date";

            for (var k = 0; k < blocks.length; k++) {
                var text = blocks[k].querySelector(blockDateSelector).textContent;
                if (text === "I dag" || text === "Oggi" || text === "Today") {
                    var bundleButtons = blocks[k].querySelectorAll("div.fp-display-bundle-title-holder");

                    for (var i = 0; i < bundleButtons.length; i++) {
                        bundleButtons[i].setAttribute("sboRecentButton", i);
                    }

                    return bundleButtons.length;
                }
            }
        });
    });

    self.then(function() {
        for(i = 0; i < numberOfBundleButtons; i++) {
            var selector = 'div[sboRecentButton="' + i + '"]';
            self.thenClick(selector, function() {
                self.wait(3000, function() {
                    self.capture('renderings/_clicked_activities.png');

                    var intermediateResult = self.evaluate(function(startTime) {
                        var result = {
                            "inTime": [],
                            "all": []
                        };
                        var visibleBody = document.querySelector("body.layout-column.md-dialog-is-showing div.md-dialog-container md-dialog");
                        var cards = visibleBody.querySelectorAll("md-card-content.fp-display-item");
                        var startHours = startTime.split(":")[0];
                        var startMins = startTime.split(":")[1];
                        for(var i = 0; i < cards.length; i++) {
                            var timeStamp = cards[i].querySelectorAll("div.fp-display-block-details.t12.g6 > span")[0].textContent;
                            var url = cards[i].querySelector("h4.fp-display-block-title > a").getAttribute("href");

                            var hours = timeStamp.split(":")[0];
                            var mins = timeStamp.split(":")[1];

                            result.all.push({
                                "timeStamp": timeStamp,
                                "url": url
                            });

                            if (hours > startHours || (hours == startHours && mins >= startMins)) {
                                result.inTime.push({
                                    "timeStamp": timeStamp,
                                    "url": url
                                });
                            }
                        }

                        return result;

                    }, records.start);

                    recentActivity.inTime = recentActivity.inTime.concat(intermediateResult.inTime);
                    recentActivity.all = recentActivity.all.concat(intermediateResult.all);
                });
            });
        }
    });

    self.then(function() {
        return;
    });
};

var compareRecentWithActual = function(self, recentActivityEntries, records) {
    var matches = records.links.filter(function(record) {
        for(var i = 0; i < recentActivityEntries.length; i++) {
            if(recentActivityEntries[i].url.indexOf(record) > -1) {
                return true;
            }
        }
    });

    var diff = records.links.filter(function(x) { return matches.indexOf(x) < 0 });

    return {
        'matches': matches,
        'difference': diff
    };
};


var verifyActivityHistoryAsync = function(self, records, cb) {
    var recentActivity = {
        "inTime": [],
        "all": []
    };
    var activityUrl = "https://myactivity.google.com/myactivity?utm_source=my-account&utm_medium=&utm_campaign=my-acct-promo";
    var matchesAndDifference;
    self.thenOpen(activityUrl, function() {
        self.wait(mid, function() {
            self.echo("Capturing activities page in _google_activities.png");
            self.capture('renderings/_activities.png');
            self.then(function() {
                getRecentAcitivtyEntriesAsync(self, recentActivity, records);
            });
            self.then(function() {
                matchesAndDifference = compareRecentWithActual(self, recentActivity, records);
            });
        });
    });

    self.then(function() {
        cb(matchesAndDifference);
    });
};

var getAndMarkGoogleLinks = function() {
    var links = document.querySelectorAll('h3.r a');
    return Array.prototype.map.call(links, function(e, counter) {
        e.setAttribute("sboGoogleLink", counter);
        return {"href": e.getAttribute('href'), "counter": counter};
    });
};










// Clickables format: (www.mylink.dk, 2)
var clickLinksAsync = function(self, matchUrl, counter, max, base, captureString, numTry, records, cb) {
    if (numTry > 5) {
        self.echo("Tried " + 5 + " times to click a link but couldn't find one, returning");
        return;
    }

    numTry = numTry + 1;

    if (counter === max) {
        self.echo("Clicked " + max + " links, returning");
        return;
    }

    var clickables;
    var number;
    var toBeClicked;
    var selector;
    var selectorCss;
    var currentUrl;

    openBasePageAndMarkATagsAsync(self, base, matchUrl, captureString, records, function(val) {
        clickables = val;
    });

    // Get ads
    self.then(function() {
        currentUrl = self.getCurrentUrl();
        var adsRecord = self.evaluate(getAds, null, true, 0, null, records.farmerTopic);
        self.then(function() {
            if(adsRecord.length > 0) {
                records.adRecords = records.adRecords.concat(adsRecord);
            } else {
                self.echo('Found no ads on basepage: ' + currentUrl);
            }
        });
    });

    self.then(function() {
        if(clickables === null) {
            self.echo("Found no clickable links matching the criteria");
            // clickLinksAsync(self, matchUrl, counter, max, base, captureString, numTry, records, cb);
            return;
        }
    });

    self.then(function() {
        number = Math.floor(Math.random() * (clickables.length - 0)) + 0;
        toBeClicked = clickables[number];
        selector = x('//a[@href="' + toBeClicked.href + '"]');
        selectorCss = 'a[href="' + toBeClicked.href + '"]';

        if (typeof toBeClicked == 'undefined') {
            self.echo("========================Found undefined");
            return;
        }
    });

    self.then(function() {
        self.evaluate(function(cssSelector) {
            document.querySelector(cssSelector).click();
        }, selectorCss);
    });

    self.then(function() {
        self.wait(mid);
    });

    self.then(function() {
        currentUrl = self.getCurrentUrl();
        self.then(function() {
            // Get ads again
            var adsRecord = self.evaluate(getAds, null, true, 0, null, records.farmerTopic);
            //TODO: How did adsRecord be null here?
            self.then(function() {
                if(adsRecord.length > 0) {
                    records.adRecords = records.adRecords.concat(adsRecord);
                } else {
                    self.echo('Found no ads on ' + currentUrl);
                }

                self.echo(JSON.stringify(records.adRecords, null, 2));
            });

            self.then(function() {
                // if (currentUrl === toBeClicked.href) {
                // self.capture("renderings/_" + captureString + "_"  + counter + '.png');
                self.then(function() {
                    counter = counter + 1;
                    numTry = 0;
                    records.links.push(toBeClicked.href);
                    clickLinksAsync(self, matchUrl, counter, max, base, captureString, numTry, records, cb);
                });
                // } else {
                //     self.echo('Expected ' + toBeClicked.href + ' but instead got ' + currentUrl + ', trying again.');
                //     clickLinksAsync(self, matchUrl, counter, max, base, captureString, numTry, records, cb);
                // }
            });
        });
    });

    self.then(function() {
        cb(records);
    });
};



var openBasePageAndMarkATagsAsync = function(self, baseUrl, matchUrl, captureString, records, cb) {
    var clickables;

    self.then(function() {
        self.open(baseUrl);
    });

    self.then(function() {
        records.bases.push(baseUrl);
        self.wait(mid);
    });

    self.then(function() {
        // self.capture("renderings/_" + captureString + "_base.png");

        self.then(function() {
            clickables = self.evaluate(function() {
                var elements = __utils__.findAll('a');

                return elements.map(function(node, counter) {
                    node.setAttribute("sboATag", counter);
                    return {"href": node.getAttribute('href'), "counter": counter};
                });
            });
        });

        self.then(function() {
            clickables = clickables.filter(function(tuple) {
                return (tuple.href.indexOf(matchUrl) > -1);
            });

            if (clickables.length < 1) {
                // self.echo("Found no links");
                cb(null);
            } else {
                // self.echo("Found " + clickables.length + " links");
                cb(clickables);
            }
        });
    });
};



var searchGoogleAndFollowLinkAsync = function(self, matchUrl, topic, captureString, records, cb) {
    var googleLinks;
    var validGoogleLinks = [];
    var href;
    var selector;
    var number;

    self.then(function() {
        self.open('http://www.google.com');
    });

    self.then(function() {
        self.wait(mid, function() {
            // self.echo("Waited " + mid + " ms after opening Google.com");
            self.capture("renderings/_google.png");
        });
    });

    var q = "";

    self.then(function() {
        self.waitForSelector('form[action="/search"]', function() {
            q = matchUrl + " " + topic;
            self.fill('form[action="/search"]', { q: q }, true);
        });
    });

    self.then(function() {
        self.wait(mid, function() {
            records.searches.push(q);
            // self.capture("renderings/_google_search_" + captureString + ".png");
        });
    });

    self.then(function() {
        googleLinks = self.evaluate(getAndMarkGoogleLinks);
    });

    self.then(function() {
        if (googleLinks.length < 1) {
            return;
        }

        for(var k = 0; k < googleLinks.length; k++) {
            href = googleLinks[k].href;
            if (href.indexOf("q=") > -1) {
                href = href.split('q=')[1];
            }

            if (href.indexOf(matchUrl) > -1) {
                validGoogleLinks.push(googleLinks[k]);
            }
        }

        number = Math.floor(Math.random() * (validGoogleLinks.length - 0)) + 0;
        selector = 'a[sboGoogleLink="' + validGoogleLinks[number].counter + '"]';

    });

    self.then(function() {
        self.click(selector);
    });

    self.then(function() {
        self.wait(mid);
    });

    // Get ads
    self.then(function() {
        var currentUrl = self.getCurrentUrl();
        self.then(function() {
            var adsRecord = self.evaluate(getAds, null, true, 0, null, records.farmerTopic);
            self.then(function() {
                if(adsRecord.length > 0) {
                    records.adRecords = records.adRecords.concat(adsRecord);
                } else {
                    self.echo('Found no ads on google link page: ' + currentUrl);
                }

                self.echo(JSON.stringify(records.adRecords, null, 2));
            });
        });

    });

    self.then(function() {
        records.googleLinks.push(validGoogleLinks[number].href);
        // self.capture("renderings/_google_link_" + captureString + "_"  + number + '.png');
    });

    self.then(function() {
        cb(records);
    });
};

module.exports.addZero = addZero;
module.exports.verifyActivityHistoryAsync = verifyActivityHistoryAsync;
module.exports.getAndMarkGoogleLinks = getAndMarkGoogleLinks;
module.exports.clickLinksAsync = clickLinksAsync;
module.exports.searchGoogleAndFollowLinkAsync = searchGoogleAndFollowLinkAsync;
module.exports.openBasePageAndMarkATagsAsync = openBasePageAndMarkATagsAsync;
