function lookForAdRecursive(self, ucr, counter, result) {
    if (counter > 10) {
        self.echo('done');
        return;
    }

    self.evaluate(function(ucr) {

    }, ucr)
}

function isAdContextual(self, lpu, basePage) {

}

function isAdGeneric(self, ucr, farmerTopic) {
    loadProfileOfUnrelatedTopic(self, farmerTopic);
    self.then(function() {

    });
}

function loadProfileOfUnrelatedTopic(self, topic) {

}

function filterAdvertisement(self, advertisement) {
    var basePage = advertisement.basePage;
    var lpu = advertisement.lpu;
    var ucr = advertisement.ucr;

    // This is the topic of the google profile used to farm the advertisement.
    var farmerTopic = advertisement.farmerTopic;

    self.openThen(basePage, function() {

    });
}

module.exports.filterAdvertisement = filterAdvertisement;