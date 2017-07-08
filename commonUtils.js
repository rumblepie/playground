function readCookies(self, cookiesFileName) {
    self.then(function() {
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
                self.echo("Reading " + cookiesFileName + " cookies file");
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

                self.echo('Done reading cookie');
            } else {
                self.echo("You need to have " + cookiesFileName + " in the folder where this script is located.");
                self.exit(1);
            }
        }
    });
};

var getAbsoluteUrl = (function() {
    var a;

    return function(url) {
        if(!a) a = document.createElement('a');
        a.href = url;

        return a.href;
    };
})();


// BLACKLIST:
// https://tpc.googlesyndication.com/pagead/images/powered-by-google.png

// ADURL FOLLOWLIST:
// adurl="https://server.adformdsp.net/C/......."
// adurl="http://traffic.srvfst.com/jsp/redirect/1784743258/index.jsp"
// adurl="http://clickserve.dartsearch.net/link/click"

// ADURL BE SMART LIST
// adurl=https://servedby.flashtalking.com/click/7/64765;1955287;1408035;210;0/?ft_impID=34370FAADB170B&g=3437D6BC53E597&random=456804590&ft_width=300&ft_height=600&url=http://bellroy.com/slim-your-wallet?utm_source=GoogleDisplayNetwork&utm_medium=display&utm_campaign=GLOBALen_Prospecting_GDN_7-300x600_GDN_Sport_Keywords_9869239411&utm_content=201601SYW_SlimYourWalletD-300x600.jpg

// UCR
// background-image: url("https://fastnet.checktrax.com/display/wix/300_250.png");

// ISSUES:
//   {
// "basePage": "https://www.ethiojobs.net/browse-by-category/Accounting%20and%20Finance/",
//     "farmerTopic": "Jobs & Education",
//     "lpu": "http://",
//     "ucr": "https://s0.2mdn.net/ads/richmedia/studio/pv2/45565663/20160922244949061/index.html?e=69&amp;renderingType=2&amp;leftOffset=0&amp;topOffset=0&amp;c=wQmKUDOuiS&amp;t=1"
// },
// UCR https://tpc.googlesyndication.com/simgad/1224690033286540387 LPU http://6219.xg4ken.com/trk/v1

// Beneath, take the adform part, url decode and follow the link
//https://r-ad.bsx.agency/%3Fdest%3Dhttps://secure-ams.adnxs.com/click%3Fwy3f0wqA5T-F61G4HoXjPwAAACCuRwtAriSn5trW5j-A8Qwa-ifpP4VsNFegoqYe1lGiwKyCiWtRmE5ZAAAAAEWKrABlAQAA-wYAAAIAAACnRhwEXmEQAAAAAABVU0QAVVNEACwB-gD8AQAAAAABAgUCAQAAAAAAhyXpgQAAAAA./cnd%3D%2521lwh7kwiDhooIEKeN8SAY3sJBIAAoADoJQU1TMTozMDU2/bn%3D63230/referrer%3Dhttps%253A%252F%252Fwww.reddit.com%252F/clickenc%3Dhttps://track.adform.net/C/%3Fbn%3D17915872

// Look for http://adfarm.mediaplex.com/ad/ck/27730-236657-37737-6?mpt=1498323376423 in LPU and follow the link

// The clickserve url is also a redirect to the real LPU.
// "lpu": "http://clickserve.dartsearch.net/link/click%3Flid%3D43700018918551613",
//     "ucr": "https://tpc.googlesyndication.com/daca_images/simgad/9008909800204233154?w=195&amp;h=102"
function getAds(frames, start, index, result, farmerTopic) {
    if (start) {
        result = [];
        frames = this.window.frames;
    }

    if (typeof frames[index] === 'undefined') {
        return result;
    }

    var ucrRegexes = [
        /(src=")(https?:\/\/(www\.)?tpc\.google[^"]+)/gi,
        /(src=")(https?:\/\/(www\.)?s1\.[^"]+)/gi,
        /(src=")(https?:\/\/(www\.)?s0\.[^"]+)/gi
    ];

    var lpuRegexes = [
        // /href=".*?(adurl=)(((?!(%3f|\?|%26|\&|%23|\#|%3b|;|%22|")).)*)/gi
        /href=".*?(adurl=)(((?!(%26|\&|%3b|;|%22|")).)*)/gi
    ];

    var currentFrame = frames[index];
    var childFrames = currentFrame.window.frames;
    var domHTML = currentFrame.window.document.body.outerHTML;
    var advertisement = { 'ucr': null, 'lpu': null, 'farmerTopic': farmerTopic, 'basePage': document.location.href };

    // Get UCR
    for(var i = 0; i < ucrRegexes.length; i++) {
        var match;
        while ((match = ucrRegexes[i].exec(domHTML)) != null) {
            // "https://s1.adformdsp.net/stoat/598/s1.adformdsp.net/load/v/0.0.126/e/.wMDAo/i/8IF-EAAABAAA/r:AdConstructor:contents/HTML:types/Standard
            // http://tpc.googlesyndication.com/safeframe/1-0-9/html/container.html?n=1
            // https://s1.adformdsp.net/stoat/598/s1.adformdsp.net/load/v/0.0.126/e/.wMDAo/i/8IF-EAAABAAA/r:types/ThirdParty
            if (match[2].indexOf("HTML:types/Standard") > -1
                || match[2].indexOf("safeframe/1-0-9/html/container.html") > -1
                || match[2].indexOf("r:types/ThirdParty") > -1) {
                    console.log("================== Got blacklisted UCR: " + match[2]);
                    continue;
            }
            var lastPart = match[2].substr(match[2].length - 3);
            // if(lastPart !== '.js') {
            //     advertisement.ucr = match[2];
            //     break;
            // }

            if(lastPart !== '.js') {
                // var suffixRegex = /(\.img|\.png|\.jpg|\.bnp|\.bmp|\.jpeg|\.tiff|\.gif|\.tif)/gi;
                // if (match[2].match(suffixRegex) !== null) {
                    console.log("========================== Got this UCR match: ");
                    console.log(match[2]);
                    advertisement.ucr = match[2];
                    break;
                // }
            }
        }

    }

    // Get LPU
    for(var k = 0; k < lpuRegexes.length; k++) {
        var match = lpuRegexes[k].exec(domHTML);

        if (match && match[2] !== "") {
            if (i === 2) {
                // console.log("Got this LPU match: ");
                // console.log(JSON.stringify(match, null, 2));
                // console.log(domHTML);
            }
            console.log("========================== Got this LPU match: ");
            console.log(match[2]);
            advertisement.lpu = match[2];
            break;
        }
    }

    if (advertisement.lpu !== null && advertisement.ucr !== null && advertisement.lpu !== "") {
        result.push(advertisement);
    }

    if (childFrames) {
        getAds(childFrames, null, 0, result, farmerTopic);
    }

    getAds(frames, null, index + 1, result, farmerTopic);

    return result;
};



function lookForAdSingle(frames, resources, index, result) {
    if (frames === null) {
        result = {'numTimes': 0};
        frames = this.window.frames;
    }

    if (typeof frames[index] === 'undefined') {
        return result;
    }

    // Dont know how to escape question mark in dynamic regex
    // var regex = new RegExp(ucr.split('?')[0].replace(/\//g, '\\/'), 'gi');
    var currentFrame = frames[index];
    var childFrames = currentFrame.window.frames;
    var domHTML = currentFrame.window.document.body.outerHTML;

    //TODO: maybe look for LPU instead?
    for(var i = 0; i < resources.length; i++) {
        var ucr = resources[i];
        var regex = new RegExp(ucr, 'gi');
        var match = regex.exec(domHTML);

        if (match) {
            result.numTimes += 1;
        }
    }

    // var regex = new RegExp('href=".*?(adurl=)(((?!(%3f|\?|%26|\&|%23|\#|%3b|;|%22|")).)*)', 'gi');

    if (childFrames) {
        lookForAdSingle(childFrames, resources, 0, result);
    }

    lookForAdSingle(frames, resources, index + 1, result);

    return result;
};


function findAd(self, resources, basePage, counter, result, cb) {
    var reloadPageMaxTimes = 12;

    self.echo('Looking for these ads: ');
    self.echo(JSON.stringify(resources, null, 2));

    if (!resources) {
        cb(null);
        return;
    }

    if (counter === reloadPageMaxTimes) {
        cb(result);
        return;
    }

    self.thenOpen(basePage, function() {
        self.wait(10000, function() {
            // self.capture('renderings/findAd_' + counter + '.png');
            var numTimes = self.evaluate(lookForAdSingle, null, resources, 0, null);

            self.then(function() {
                if(!numTimes) {
                    findAd(self, resources, basePage, counter + 1, result, cb);
                } else {
                    if(numTimes.numTimes > 0) {
                        findAd(self, resources, basePage, reloadPageMaxTimes, result + numTimes.numTimes, cb);
                    } else {
                        findAd(self, resources, basePage, counter + 1, result + numTimes.numTimes, cb);
                    }
                }
            });
        });
    });
}



// ISSUES:
// "http://www.panelsog.net/": {
//     "basePage": "https://www.ethiojobs.net/find-jobs-in-ethiopia/Oromia/",
//         "farmerTopic": "Jobs & Education",
//         "resources": [
//         "https://tpc.googlesyndication.com/daca_images/simgad/5974313596689456236?w=400&amp;h=209"
//     ],
//         "lpu": "http://www.panelsog.net/"
// },
// "http://www.panelsog.net": {
//     "basePage": "https://www.ethiojobs.net/find-jobs-in-ethiopia/Oromia/",
//         "farmerTopic": "Jobs & Education",
//         "resources": [
//         "https://tpc.googlesyndication.com/simgad/6057923849749272892"
//     ],
//         "lpu": "http://www.panelsog.net"
// },
function squashRecords(adRecords) {
    var result = {'keys': []};

    adRecords.map(function(record) {
        record.ucr = record.ucr.split('?')[0].replace(/\//g, '\\/');

        var cleanUpRegex = /(.*?)(?=(%3f|\?|%26|\&|%23|\#|%3b|;|%22|"))/i;
        var match = cleanUpRegex.exec(record.lpu);
        if (match !== null) {
            // console.log("match");
            // console.log(JSON.stringify(match, null, 2));
            record.lpu = match[1];
        }

        //TODO: take into consideration that an ad can be displayed on multiple basepages
        if (result[record.lpu]) {
            if (!(result[record.lpu].resources.indexOf(record.ucr) > -1)) {
                result[record.lpu].resources.push(record.ucr);
            }
        } else {
            result[record.lpu] = {};
            result[record.lpu].basePage = record.basePage;
            result[record.lpu].farmerTopic = record.farmerTopic;
            result[record.lpu].resources = [record.ucr];
            result[record.lpu].lpu = record.lpu;
            result.keys.push(record.lpu);
        }
    });

    return result;
}

module.exports.readCookies = readCookies;
module.exports.getAds = getAds;
module.exports.findAd = findAd;
module.exports.squashRecords = squashRecords;