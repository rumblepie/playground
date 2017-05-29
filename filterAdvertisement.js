function loadProfileOfUnrelatedTopic(self, topic) {

}

function isAdContextual(self, lpu, basePage) {

}

function isAdGeneric(self, ucr, farmerTopic) {
    // Could this also simply be without any cookies?
    loadProfileOfUnrelatedTopic(self, farmerTopic);
    self.then(function() {
        var adFoundNumTimes = findAd(self, null, ucr, 0, 0, 0);
    });
}

function filterAdvertisement(self, advertisement, cb) {
    if (typeof findAd === 'undefined') {
        self.echo('Could not find findAd function');
        self.exit(1);
    }

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
                var isGeneric = isAdGeneric(self, ucr, farmerTopic);
                self.then(function() {
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