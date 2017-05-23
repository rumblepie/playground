var recentActivity = [];

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
                    self.capture('_clicked_activities.png');

                    var intermediateResult = self.evaluate(function(startTime) {
                        var result = [];
                        var visibleBody = document.querySelector("body.layout-column.md-dialog-is-showing div.md-dialog-container md-dialog");
                        var cards = visibleBody.querySelectorAll("md-card-content.fp-display-item");
                        var startHours = startTime.split(":")[0];
                        var startMins = startTime.split(":")[1];
                        for(var i = 0; i < cards.length; i++) {
                            var timeStamp = cards[i].querySelectorAll("div.fp-display-block-details.t12.g6 > span")[0].textContent;
                            var url = cards[i].querySelector("h4.fp-display-block-title > a").getAttribute("href");

                            var hours = timeStamp.split(":")[0];
                            var mins = timeStamp.split(":")[1];

                            result.push({
                                "timeStamp": timeStamp,
                                "url": url
                            });

                            if (hours > startHours || (hours == startHours && mins >= startMins)) {
                                // result.push({
                                //     "timeStamp": timeStamp,
                                //     "url": url
                                // });
                            }
                        }

                        return result;

                    }, records.start);

                    recentActivity = recentActivity.concat(intermediateResult);
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
    self.echo("==================================");
    self.echo("==================================");
    self.echo("Data recorded by Google: ");
    self.echo(JSON.stringify(recentActivityEntries, null, 2));
    self.echo("=======================================================================================");

    var matches = records.links.filter(function(record) {
        for(var i = 0; i < recentActivityEntries.length; i++) {
            if(recentActivityEntries[i].url.indexOf(record) > -1) {
                self.echo("RECORD: " + record);
                self.echo("MATCHED GOOGLE ACTIVITY: " + recentActivityEntries[i].url);
                self.echo("");
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
        self.wait(5000, function() {
            self.echo("Capturing activities page in _google_activities.png");
            self.capture('_activities.png');
            getRecentAcitivtyEntriesAsync(self, records);
            self.then(function() {
                compareRecentWithActual(self, recentActivity, records);
            });
        });
    });
};

var getGoogleLinks = function() {
    var links = document.querySelectorAll('h3.r a');
    return Array.prototype.map.call(links, function(e) {
        return e.getAttribute('href');
    });
};

var clickLinksAsync = function(self, clickables, counter, max, base, captureString, numTry) {
    if (numTry > 10) {
        self.echo("Tried " + 10 + " times to click a link but couldn't find one, returning");
        return;
    }

    numTry = numTry + 1;

    if (counter === max) {
        self.echo("Clicked " + maxLinksClicked + " links, moving to Google search");
        return;
    }

    var number = Math.floor(Math.random() * (clickables.length - 0)) + 0;
    var toBeClicked = clickables[number];

    if (typeof toBeClicked == 'undefined') {
        self.echo("========================Found undefined");
        return;
    }

    var selector = "a[href=\"" + toBeClicked + "\"]";

    self.thenOpen(base, function() {
        records.bases.push(base);
        self.echo("Opened base page: " + base);
        self.echo("Current click counter: " + counter);

        self.wait(mid, function() {
            self.echo("Waited " + mid + " ms after opening base page");
        });

        self.then(function() {
            if(self.exists(selector)) {
                self.thenClick(selector, function(){
                    self.waitForUrl(
                        toBeClicked,
                        function wfuThen() {
                            self.echo("Clicked " + toBeClicked + " (number " + number + ")");
                            records.links.push(toBeClicked);

                            self.capture("_preWait_" + captureString + "_"  + counter + '.png');

                            self.wait(mid, function() {
                                self.echo("Waited " + mid + " ms after clicking base page link");
                                self.echo("New url after clicking link: " + self.getCurrentUrl());
                                self.capture("_" + captureString + "_"  + counter + '.png');
                                counter = counter + 1;
                            });
                        },
                        function wfuTimeout() {
                            self.echo("This url: <<<" + toBeClicked + ">>> did not load in time");
                        },
                        high
                    );
                });
            } else {
                self.echo("Couldn't find selector: " + selector);
            }
        });
    });

    self.then(function() {
        clickLinksAsync(self, clickables, counter, max, base, captureString, numTry);
    });
};

var addZero = function(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
};

module.exports.addZero = addZero;
module.exports.verifyActivityHistoryAsync = verifyActivityHistoryAsync;
module.exports.getGoogleLinks = getGoogleLinks;
module.exports.clickLinksAsync = clickLinksAsync;