var readCookies = function(self, cookiesFileName) {
    if (!cookiesFileName) {
        self.echo("You need to supply the name of a cookies file like --cookies=<cookiesFileName>");
        self.exit(1);
    } else {
        if(typeof fs === 'undefined') {
            self.echo("You must include fs in the script requiring this script");
            self.exit(1);
        }

        if(typeof phantom === 'undefined') {
            self.echo("Phantomjs must be available in scope");
            self.exit(1);
        }

        if (fs.exists(cookiesFileName)) {
            self.echo("Reading " + cookiesFileName + " file");
            // var cookies = fs.read("cookiesSavedByPhantomjs.txt");
            // phantom.cookies = JSON.parse(cookies);
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
var goThroughIframes = function goThroughIframes(frames, start, index, result) {
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
        goThroughIframes(childFrames, null, 0, result);
    }

    goThroughIframes(frames, null, index + 1, result);

    return result;
};

module.exports.readCookies = readCookies;
module.exports.goThroughIframes = goThroughIframes;