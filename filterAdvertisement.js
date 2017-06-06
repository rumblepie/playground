function loadProfileOfUnrelatedTopicAsync(self, topic, cb) {
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

    var isDone;

    self.eachThen(profiles, function(response) {
        var profile = response.data;
        if (profile.canBeUsedForFiltering === true && !isDone) {
            if (profile.topic !== topic) {
                self.echo('Loading profile: ' + profile.email);
                loginToGoogleAsync(self, profile.email, profile.password);
                self.then(function() {
                    isDone = true;
                    cb(true);
                    return;
                });

            }
        }
    });
}

//TODO: Squashing of varied size ads is needed here.
function isAdGeneric(self, resources, basePage, farmerTopic, cb) {
    // Could this also simply be without any cookies?
    phantom.clearCookies();
    self.clear();

    self.then(function() {
        loadProfileOfUnrelatedTopicAsync(self, farmerTopic, function(retVal) {
            self.echo('Profile did load?: ' + retVal);
        });
    });

    self.then(function() {
        self.echo('Finding resources on ' + basePage);
        findAd(self, resources, basePage, 0, 0, function(num) {
            self.echo('Found ad ' + num + ' times');
            if (num > 0) {
                cb(true);
            } else {
                cb(false);
            }
        });
    });
}

function isAdContextual(self, lpu, basePage, cb) {
    // The statefulness of some cookies might interfer with Google AdWords, so we must clear
    phantom.clearCookies();
    self.clear();

    self.then(function() {
        getTopics(self, basePage, true, function(basePageTopics) {
            basePageTopics = basePageTopics;
            self.then(function() {
                getTopics(self, lpu, false, function(lpuTopics) {
                    self.echo(JSON.stringify(basePageTopics, null, 2));
                    self.echo(JSON.stringify(lpuTopics, null, 2));

                    if (basePageTopics && lpuTopics) {
                        var allBase = basePageTopics.allTopics.toLowerCase().split(': ')[1].split(' > ');
                        var allLpu = lpuTopics.allTopics.toLowerCase().split(': ')[1].split(' > ');
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
            });
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

    if (!advertisement) {
        self.echo('Empty advertisement');
        self.exit(1);
    }

    // var adWordsCookieFileName = self.cli.get("pass");
    var basePage = advertisement.basePage;
    var lpu = advertisement.lpu;
    var resources = advertisement.resources;

    // This is the topic of the google profile used to farm the advertisement.
    var farmerTopic = advertisement.farmerTopic;

    self.then(function() {
        isAdContextual(self, lpu, basePage, function(isContextual) {
            if(isContextual) {
                cb('contextual');
                return;
            }
            else {
                isAdGeneric(self, resources, basePage, farmerTopic, function(isGeneric) {
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


// Filters all the advertisements in the adRecords
function filterAdRecords(self, adRecords, cb) {
    var result = [];

    self.eachThen(adRecords.keys, function(response) {
        var adRecordKey = response.data;
        var adRecord = adRecords[adRecordKey];
        self.echo('keys2');
        self.echo(JSON.stringify(adRecord, null, 2));
        self.then(function() {
            filterAdvertisement(self, adRecord, function(adType) {
                adRecord['type'] = adType;
                self.echo('==============================');
                self.echo('');
                self.echo('');
                self.echo('');
                self.echo(JSON.stringify(adRecord, null, 2));
                self.echo('');
                self.echo('');
                self.echo('');
                self.echo('Ad filter result: ' + adType);
                self.echo('==============================');
                result.push(adRecord);
            });
        });
    });

    self.then(function() {
        cb(result);
    });
}

module.exports.filterAdvertisement = filterAdvertisement;
module.exports.filterAdRecords = filterAdRecords;