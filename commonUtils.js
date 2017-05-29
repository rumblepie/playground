function readCookies(self, cookiesFileName) {
    if (!cookiesFileName) {
        self.echo("You need to supply the name of a cookies file like --cookies=<cookiesFileName>");
        self.exit(1);
    } else {
        if(typeof fs === 'undefined') {
            self.echo("Could not find fs function");
            self.exit(1);
        }

        if(typeof phantom === 'undefined') {
            self.echo("Phantomjs must be available in scope");
            self.exit(1);
        }

        if (fs.exists(cookiesFileName)) {
            self.echo("Reading " + cookiesFileName + " file");
            var cookiesNetscape = fs.read(cookiesFileName).split('\n');
            for(var i = 0; i < cookiesNetscape.length; i++) {
                var line = cookiesNetscape[i];
                if (line.substring(0,1) === '#' || !line) {
                    continue;
                }

                var fields = line.split('\t');

                if(fields.length > 7) {
                    self.echo("> 7 fields detected, check the format of the cookies file");
                    self.exit(1);
                }

                var cookie = {
                    domain: fields[0],
                    flag: fields[1],
                    path: fields[2],
                    secure: fields[3],
                    expiration: fields[4],
                    name: fields[5],
                    value: fields[6],
                };

                phantom.addCookie(cookie);
            }
        } else {
            self.echo("You need to have " + cookiesFileName + " in the folder where this script is located.");
            self.exit(1);
        }
    }
};

var getAbsoluteUrl = (function() {
    var a;

    return function(url) {
        if(!a) a = document.createElement('a');
        a.href = url;

        return a.href;
    };
})();



//https://s1.adform.net/Banners/17774310/17774310.jpg?bv=2
function getAds(frames, start, index, result) {
    if (start) {
        result = {
            'ads': [],
            'basePage': document.location.href
        };
        frames = this.window.frames;
    }

    if (typeof frames[index] === 'undefined') {
        return result;
    }

    var ucrRegexes = [
        /(src=")(https?:\/\/(www\.)?tpc\.google[^"]+)/gi,
        /(src=")(https?:\/\/(www\.)?s1\.adform[^"]+)/gi
    ];

    var lpuRegexes = [
        /href=".*?(adurl=)(((?!(%3f|\?|%26|\&|%23|\#|%3b|;|%22|")).)*)/gi
    ];

    var currentFrame = frames[index];
    var childFrames = currentFrame.window.frames;
    var domHTML = currentFrame.window.document.body.outerHTML;
    var advertisement = { 'ucr': null, 'lpu': null };

    // Get UCR
    for(var i = 0; i < ucrRegexes.length; i++) {
        var match = ucrRegexes[i].exec(domHTML);

        if (match) {
            var ucrMatch = match[2];
            var lastPart = ucrMatch.substr(ucrMatch.length - 3);
            if(lastPart !== '.js') {
                advertisement.ucr = ucrMatch;
                break;
            }
        }
    }

    // Get LPU
    for(var k = 0; k < lpuRegexes.length; k++) {
        // var match = new RegExp(lpuRegexes[k], 'g').exec(domHTML);
        var match = lpuRegexes[k].exec(domHTML);

        if (match) {
            advertisement.lpu = match[2];
        }
    }

    if (advertisement.lpu !== null && advertisement.ucr !== null) {
        result.ads.push(advertisement);
    }

    if (childFrames) {
        getAds(childFrames, null, 0, result);
    }

    getAds(frames, null, index + 1, result);

    return result;
};

function lookForAdSingle(frames, ucr, index, result) {
    if (frames === null) {
        result = {'numTimes': 0};
        frames = this.window.frames;
    }

    if (typeof frames[index] === 'undefined') {
        return result;
    }

    // Dont know how to escape question mark in dynamic regex
    var regex = new RegExp(ucr.split('?')[0].replace(/\//g, '\\/'), 'gi');
    var currentFrame = frames[index];
    var childFrames = currentFrame.window.frames;
    var domHTML = currentFrame.window.document.body.outerHTML;
    var match = regex.exec(domHTML);

    if (match) {
        result.numTimes += 1;
    }

    if (childFrames) {
        lookForAdSingle(childFrames, ucr, 0, result);
    }

    lookForAdSingle(frames, ucr, index + 1, result);

    return result;
};


function findAd(self, advertisement, basePage, counter, result, cb) {
    if (counter === 3) {
        return cb(result);
    }

    self.thenOpen(basePage, function() {
        self.wait(10000, function() {
            self.capture('renderings/findAd_' + counter + '.png');
            var numTimes = self.evaluate(lookForAdSingle, null, advertisement.ucr, 0, null);
            self.then(function() {
                findAd(self, advertisement, basePage, counter + 1, result + numTimes.numTimes, cb);
            });
        });
    });
}



module.exports.readCookies = readCookies;
module.exports.getAds = getAds;
module.exports.findAd = findAd;