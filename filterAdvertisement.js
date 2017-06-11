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
                loginToGoogleAsync(self, profile.email, profile.password, 0);
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
    // phantom.clearCookies();
    // self.clear();

    // self.then(function() {
    //     loadProfileOfUnrelatedTopicAsync(self, farmerTopic, function(retVal) {
    //         self.echo('Profile did load?: ' + retVal);
    //     });
    // });

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

function isAdContextual(self, lpuTopics, basePageTopics, cb) {
    self.then(function() {
        if (basePageTopics && lpuTopics) {
            var allBase = basePageTopics.toLowerCase().split(': ')[1].split(' > ');
            var allLpu = lpuTopics.toLowerCase().split(': ')[1].split(' > ');
            var intersection = allBase.filter(function(topic) {
                return allLpu.indexOf(topic) > -1;
            });
            if (intersection.length > 0) {
                cb(true);
            } else {
                cb(false);
            }
        } else {
            if (!basePageTopics) {
                self.echo('Did not get any base page topics');
            }

            if (!lpuTopics) {
                self.echo('Did not get any landing page topics');
            }

            cb(null);
        }
    });
}


function filterAdvertisement(self, advertisement, basePageTopics, cb) {
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
    var basePageTopics = basePageTopics;
    var basePage = advertisement.basePage;
    var lpuTopics = advertisement.allTopics;
    var resources = advertisement.resources;

    // This is the topic of the google profile used to farm the advertisement.
    var farmerTopic = advertisement.farmerTopic;

    self.then(function() {
        isAdContextual(self, lpuTopics, basePageTopics, function(isContextual) {
            if(isContextual) {
                cb('contextual');
                return;
            }
            if (isContextual === null) {
                self.echo('Google Display Planner could not classify one the end points, returning');
                cb(null);
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
    var result = {'basePages': {}, 'adRecords': []};

    self.clear();
    phantom.clearCookies();

    // Import the adwords cookie
    var adWordsCookieFileName = self.cli.get("adWordsCookie");
    if(!adWordsCookieFileName) {
        self.echo("You need to supply --adWordsCookie");
        self.exit(1);
    } else {
        readCookies(self, adWordsCookieFileName);
    }


    self.eachThen(adRecords.keys, function(response) {
        var adRecordKey = response.data;
        var adRecord = adRecords[adRecordKey];
        self.echo('Working on ' + adRecordKey);

        getTopics(self, adRecord.lpu, false, function (topics) {
            if (topics) {
                adRecord['allTopics'] = topics.allTopics;
                adRecord['headTopics'] = topics.headTopics;
            } else {
                adRecord['allTopics'] = null;
                adRecord['headTopics'] = null;
            }
        });

        self.then(function() {
            self.echo(JSON.stringify(result, null, 2));
            if (!result.basePages[adRecord.basePage]) {
                result.basePages[adRecord.basePage] = {};
                getTopics(self, adRecord.basePage, false, function (topics) {
                    if (topics) {
                        result.basePages[adRecord.basePage]['allTopics'] = topics.allTopics;
                        result.basePages[adRecord.basePage]['headTopics'] = topics.headTopics;
                    } else {
                        result.basePages[adRecord.basePage]['allTopics'] = null;
                        result.basePages[adRecord.basePage]['headTopics'] = null;
                    }
                });
            }
        });
    });

    self.then(function() {
        self.echo('Clearing cookies before new login');
        self.clear();
        phantom.clearCookies();
    });

    // For a faster / simpler experiement, we do this.
    self.then(function() {
        self.echo('Logging into google with crescente profile');
        loginToGoogleAsync(self, 'crescente.pisano@lab.imtlucca.it', 'wkgn4n5k3TG', 0);
    });

    self.eachThen(adRecords.keys, function(response) {
        var adRecordKey = response.data;
        var adRecord = adRecords[adRecordKey];

        self.echo('===================================');
        self.echo('');
        self.echo('');
        self.echo('');
        self.echo('');
        self.echo('');
        self.echo(JSON.stringify(adRecord, null, 2));
        self.echo('');
        self.echo('');
        self.echo('');
        self.echo('');
        self.echo('');
        self.echo(result.basePages[adRecord.basePage]);
        self.echo('===================================');

        filterAdvertisement(self, adRecord, result.basePages[adRecord.basePage]['allTopics'], function(adType) {
            adRecord['type'] = adType;
            self.echo('Ad filter result: ' + adType);
            result.adRecords.push(adRecord);
        });
    });

    self.then(function() {
        self.echo('');
        self.echo('');
        self.echo('');
        self.echo('');
        self.echo('');
        self.echo('');
        self.echo(JSON.stringify(result, null, 2));
        cb(result);
    });
}

module.exports.filterAdvertisement = filterAdvertisement;
module.exports.filterAdRecords = filterAdRecords;