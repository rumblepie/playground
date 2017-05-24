var addZero = function(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
};

var mid = 6500;
var high = 10000;
var recentActivity = {
    "inTime": [],
    "all": []
};
var date = new Date();
var records = {
    "start": date.getHours() + ":" + addZero(date.getMinutes()),
    "links": [],
    "searches": [],
    "googleLinks": [],
    "bases": []
};

var getRecentAcitivtyEntriesAsync = function(self, records) {
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
    self.echo("=======================================================================================");
    self.echo("Data recorded by us: ");
    self.echo(JSON.stringify(records, null, 2));
    fs.write("data_us.txt", JSON.stringify(records, null, 2), 'w');
    self.echo("==================================");
    self.echo("==================================");
    self.echo("Data recorded by Google: ");
    self.echo(JSON.stringify(recentActivityEntries, null, 2));
    fs.write("data_google.txt", JSON.stringify(recentActivityEntries, null, 2), 'w');
    self.echo("=======================================================================================");

    var matches = records.links.filter(function(record) {
        for(var i = 0; i < recentActivityEntries.length; i++) {
            if(recentActivityEntries[i].url.indexOf(record) > -1) {
                return true;
            }
        }
    });

    self.echo("Matches:");
    self.echo(JSON.stringify(matches, null, 2));

    var diff = records.links.filter(function(x) { return matches.indexOf(x) < 0 });
    self.echo("Difference:");
    self.echo(JSON.stringify(diff, null, 2));
};


var verifyActivityHistoryAsync = function(self, records) {
    var activityUrl = "https://myactivity.google.com/myactivity?utm_source=my-account&utm_medium=&utm_campaign=my-acct-promo";
    self.thenOpen(activityUrl, function() {
        self.wait(mid, function() {
            self.echo("Capturing activities page in _google_activities.png");
            self.capture('renderings/_activities.png');
            self.then(function() {
                getRecentAcitivtyEntriesAsync(self, records);
            });
            self.then(function() {
                compareRecentWithActual(self, recentActivity, records);
            });
        });
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
var clickLinksAsync = function(self, matchUrl, counter, max, base, captureString, numTry) {
    if (numTry > 5) {
        self.echo("Tried " + 5 + " times to click a link but couldn't find one, returning");
        return;
    }

    numTry = numTry + 1;

    if (counter === max) {
        self.echo("Clicked " + maxLinksClicked + " links, returning");
        return;
    }
    var clickables;
    var number;
    var toBeClicked;
    var selector;
    var selectorCss;

    self.then(function() {
        openBasePageAndMarkATagsAsync(self, base, matchUrl, captureString, function(val) {
            clickables = val;
        });
    });

    self.then(function() {
        if(clickables === null) {
            self.echo("Found no clickable links matching the criteria");
            clickLinksAsync(self, matchUrl, counter, max, base, captureString, numTry);
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

        // self.echo("Current click counter: " + counter);
        // self.echo("Current try counter: " + numTry);
    });

    self.then(function() {
        self.evaluate(function(cssSelector) {
            document.querySelector(cssSelector).click();
        }, selectorCss);
    });

    self.then(function() {
        // self.capture("renderings/_preWait_" + captureString + "_"  + counter + '.png');
        // self.echo("Clicked " + toBeClicked.href + " (number " + number + ")");
        self.wait(mid);
    });

    self.then(function() {
        var currentUrl = self.getCurrentUrl();
        if (currentUrl === toBeClicked.href) {
            // self.echo("New url after clicking link: " + currentUrl);
            self.capture("renderings/_" + captureString + "_"  + counter + '.png');
            self.then(function() {
                counter = counter + 1;
                numTry = 0;
                records.links.push(toBeClicked.href);
                clickLinksAsync(self, matchUrl, counter, max, base, captureString, numTry);
            });
        } else {
            clickLinksAsync(self, matchUrl, counter, max, base, captureString, numTry);
        }
    });
};

var openBasePageAndMarkATagsAsync = function(self, baseUrl, matchUrl, captureString, cb) {
    var clickables;

    self.then(function() {
        self.open(baseUrl);
    });

    self.then(function() {
        // self.echo("Base URL opened: " + baseUrl);
        records.bases.push(baseUrl);
        // self.capture("renderings/_preWait_" + captureString + "_base.png");
        self.wait(mid);
    });

    self.then(function() {
        self.capture("renderings/_" + captureString + "_base.png");

        self.then(function() {
            clickables = this.evaluate(function() {
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

var getRecords = function() {
    return records;
};

var searchGoogleAndFollowLinkAsync = function(self, matchUrl, profileData, captureString) {
    var googleLinks;
    var validGoogleLinks = [];
    var href;
    var selector;
    var number;

    self.open('http://www.google.com');

    self.then(function() {
        self.wait(mid, function() {
            // self.echo("Waited " + mid + " ms after opening Google.com");
            self.capture("renderings/_google.png");
        });
    });

    var q = "";

    self.then(function() {
        self.waitForSelector('form[action="/search"]', function() {
            q = matchUrl + " " + profileData.topic;
            // self.echo("q value: " + q);
            self.fill('form[action="/search"]', { q: q }, true);
        });
    });

    self.then(function() {
        self.wait(mid, function() {
            records.searches.push(q);
            // self.echo("Waited " + mid + " ms after submitting Google search form");
            self.capture("renderings/_google_search_" + captureString + ".png");
        });
    });

    self.then(function() {
        googleLinks = self.evaluate(getAndMarkGoogleLinks);
    });

    self.then(function() {
        if (googleLinks.length < 1) {
            // self.echo("Found no google links");
            return;
        }

        for(var k = 0; k < googleLinks.length; k++) {
            href = googleLinks[k].href;
            // self.echo("Google link number " + k + ": " + href);
            if (href.indexOf("q=") > -1) {
                href = href.split('q=')[1];
            }

            if (href.indexOf(matchUrl) > -1) {
                validGoogleLinks.push(googleLinks[k]);
            }
        }

        // self.echo("Got " + validGoogleLinks.length + " valid Google links");
        number = Math.floor(Math.random() * (validGoogleLinks.length - 0)) + 0;
        selector = 'a[sboGoogleLink="' + validGoogleLinks[number].counter + '"]';

    });

    self.then(function() {
        // self.echo("Clicking " + validGoogleLinks[number].href);
        self.click(selector);
    });

    self.then(function() {
        // self.capture("renderings/_google_link_preWait_" + captureString + "_"  + number + '.png');
        self.wait(mid);
    });

    self.then(function() {
        // self.echo("Clicked on this link: " + validGoogleLinks[number].href + " (number " + number + ")");
        records.googleLinks.push(validGoogleLinks[number].href);
        self.capture("renderings/_google_link_" + captureString + "_"  + number + '.png');
    });
};

module.exports.addZero = addZero;
module.exports.verifyActivityHistoryAsync = verifyActivityHistoryAsync;
module.exports.getAndMarkGoogleLinks = getAndMarkGoogleLinks;
module.exports.clickLinksAsync = clickLinksAsync;
module.exports.getRecords = getRecords;
module.exports.searchGoogleAndFollowLinkAsync = searchGoogleAndFollowLinkAsync;
module.exports.openBasePageAndMarkATagsAsync = openBasePageAndMarkATagsAsync;
