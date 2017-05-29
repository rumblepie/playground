function loadProfileOfUnrelatedTopicAsync(self, topic) {
    var profilesFileName = self.cli.get("profiles");
    var profiles;
    if (!profilesFileName) {
        self.echo('You must supply a set of --profiles');
        self.exit(1);
    }

    if (fs.exists(profilesFileName)) {
        profiles = JSON.parse(fs.read(profilesFileName));
    } else {
        self.echo('Could not find ' + profilesFileName);
        self.exit(1);
    }

    if (profiles.length < 1) {
        self.echo('Did not find any profiles in the profiles file');
        self.exit(1);
    }

    for(var i = 0; i < profiles.length; i++) {
        if (profiles[i].canBeUsedForFiltering === true) {
            if (profiles[i].topic !== topic) {
                //load
                loginToGoogleAsync(self, profiles[i].email, profiles[i].password);
                self.then(function() {
                    self.echo('Loaded profile: ' + profiles[i].email);
                    return;
                });
            }
        }
    }
}

function isAdContextual(self, lpu, basePage, cb) {
    // The statefulness of some cookies might interfer with Google AdWords, so we must clear
    phantom.clearCookies();
    self.clear();

    var basePageTopics;
    var lpuTopics;

    self.then(function() {
        getTopics(self, basePage, true, function(basePageTopics) {
            basePageTopics = basePageTopics;
            getTopics(self, lpu, false, function(lpuTopics) {
                lpuTopics = lpuTopics;
            });
        });
    });

    self.then(function() {
        if (basePageTopics && lpuTopics) {
            var allBase = basePageTopics.allTopics.split('Topics: ')[1].split(' > ');
            var allLpu = lpuTopics.allTopics.split('Topics: ')[1].split(' > ');
            var intersection = allBase.filter(function(topic) {
                return allLpu.indexOf(topic) > -1;
            });
            if (intersection.length > 0) {
                cb(true);
            } else {
                cb(false);
            }
        } else {
            self.echo('Could not find any topics for: ' + basePage + ' and/or ' + lpu);
            cb(null);
        }

    });
}

function isAdGeneric(self, ucr, basePage, farmerTopic, cb) {
    // Could this also simply be without any cookies?
    phantom.clearCookies();
    self.clear();

    self.then(function() {
        loadProfileOfUnrelatedTopicAsync(self, farmerTopic);
    });

    self.then(function() {
        findAd(self, ucr, basePage, 0, 0, function(num) {
            if (num > 0) {
                cb(true);
            }
        });
    });
}

function filterAdvertisement(self, advertisement, cb) {
    if (typeof findAd === 'undefined') {
        self.echo('Could not find findAd function');
        self.exit(1);
    }

    if (typeof getTopics === 'undefined') {
        self.echo('Could not find getTopics function');
        self.exit(1);
    }

    if (typeof fs === 'undefined') {
        self.echo('Could not find fs function');
        self.exit(1);
    }

    if (typeof phantom === 'undefined') {
        self.echo('Could not find phantom object');
        self.exit(1);
    }

    if (typeof loginToGoogleAsync === 'undefined') {
        self.echo('Could not find Google login function');
        self.exit(1);
    }


    var adWordsCookieFileName = self.cli.get("pass");
    var basePage = advertisement.basePage;
    var lpu = advertisement.lpu;
    var ucr = advertisement.ucr;

    // This is the topic of the google profile used to farm the advertisement.
    var farmerTopic = advertisement.farmerTopic;

    self.then(function() {
        var isContextual = isAdContextual(self, lpu, basePage);
        self.then(function() {
            if(isContextual) {
                cb('contextual');
                return;
            }
            else {
                isAdGeneric(self, ucr, basePage, farmerTopic, function(isGeneric) {
                    if(isGeneric) {
                        cb('generic');
                        return;
                    }
                    else {
                        cb('targeted');
                        return;
                    }
                });
            }
        });
    });
}

module.exports.filterAdvertisement = filterAdvertisement;