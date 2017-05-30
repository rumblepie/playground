function buildProfileAsync(self, profile, clickMaxLinks, verify, cb) {
    if(typeof addZero === 'undefined') {
        self.echo("Could not find addZero function");
        self.exit(1);
    }
    if(typeof loginToGoogleAsync === 'undefined') {
        self.echo("Could not find loginToGoogleAsync function");
        self.exit(1);
    }
    if(typeof verifyActivityHistoryAsync === 'undefined') {
        self.echo("Could not find verifyActivityHistoryAsync function");
        self.exit(1);
    }
    if(typeof clickLinksAsync === 'undefined') {
        self.echo("Could not find clickLinksAsync function");
        self.exit(1);
    }
    if(typeof searchGoogleAndFollowLinkAsync === 'undefined') {
        self.echo("Could not find searchGoogleAndFollowLinkAsync function");
        self.exit(1);
    }

    var date = new Date();
    var records = {
        'start': date.getHours() + ':' + addZero(date.getMinutes()),
        'links': [],
        'searches': [],
        'googleLinks': [],
        'bases': [],
        'end': ''
    };

    loginToGoogleAsync(self, profile.email, profile.password);
    self.then(function() {
        self.echo("Logged in to Google");
    });

    self.eachThen(profile.builtOnPages, function(response){
        var baseUrl = response.data;

        if (!baseUrl) {
            self.echo('No pages to build on, fix the profiles file');
            self.exit(1);
        }

        var matchUrl = baseUrl.split("://")[1];
        var captureString = matchUrl.split(".")[0] + "_" + matchUrl.split(".")[1];

        self.then(function() {
            clickLinksAsync(self, matchUrl, 0, clickMaxLinks, baseUrl, captureString, 0, records, function(records) {
                records = records;
            });
            self.then(function() {
                self.clear();
            });
            self.then(function() {
                self.page.stop();
            });
            self.then(function() {
                self.echo("Finished clicking links on " + baseUrl + ", moving to Google Search");
            });
        });

        self.then(function() {
            searchGoogleAndFollowLinkAsync(self, matchUrl, profile.topic, captureString, records, function(records) {
                records = records;
            });
            self.then(function() {
                self.clear();
            });
            self.then(function() {
                self.page.stop();
            });
            self.then(function() {
                self.echo("Finished with base url: " + baseUrl + ", moving on to next base url");
            });
        });
    });

    self.then(function() {
        date = new Date();
        records['end'] = date.getHours() + ":" + addZero(date.getMinutes());
        var matchesAndDifference;
        if (verify) {
            self.echo('Verifying history activity');
            verifyActivityHistoryAsync(self, records, function(retVal) {
                matchesAndDifference = retVal;
            });
            self.then(function() {
                cb(records, matchesAndDifference);
            });
        } else {
            cb(records);
        }
    });
}

module.exports.buildProfileAsync = buildProfileAsync;