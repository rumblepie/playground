/**
 * Created by sbo on 20-03-2017.
 */
var fs = require('fs');
var page = require('webpage').create();
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.38 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36';
page.settings.webSecurityEnabled = false;
page.settings.resourceTimeout = 100000;
page.viewportSize = { width: 1460, height: 1024 };
// page.viewportSize = { width: 1024, height: 768 };

monadsCookieText = "visit_cookie=true; sc_is_visitor_unique=rx10384643.1490041134.1C0E552364864FDDB26B0A8DBAD24771.5.4.4.4.4.3.3.3.3; _ga=GA1.2.1921956229.1488977255; _gat=1";
monadsCookie = {
    domain: '.monadsproject.com',
    expires: 'Sat Oct 11 2014 21:44:33 GMT+0200 (CEST)',
    expiry: 1476128618,
    httponly: false,
    name: '_ga',
    path: '/',
    secure: false,
    value: 'GA1.2.1921956229.1488977255'
};

monadsCookie2 = {
    domain: '.monadsproject.com',
    expires: 'Sat Oct 11 2014 21:44:33 GMT+0200 (CEST)',
    expiry: 1476128618,
    httponly: false,
    name: '_gat',
    path: '/',
    secure: false,
    value: '1'
};

monadsCookie3 = {
    domain: '.monadsproject.com',
    expires: 'Sat Oct 11 2014 21:44:33 GMT+0200 (CEST)',
    expiry: 1476128618,
    httponly: false,
    name: 'sc_is_visitor_unique',
    path: '/',
    secure: false,
    value: 'rx10384643.1490612335.1C0E552364864FDDB26B0A8DBAD24771.13.12.10.10.8.6.4.4.3'
};
monadsCookie4 = {
    domain: '.monadsproject.com',
    expires: 'Sat Oct 11 2014 21:44:33 GMT+0200 (CEST)',
    expiry: 1476128618,
    httponly: false,
    name: 'visit_cookie',
    path: '/',
    secure: false,
    value: 'true'
};



doubleClickCookie1 = {
    domain: '.doubleclick.net',
    expires: '2017-04-10T00:00:12.789Z',
    httponly: false,
    name: 'DSID',
    path: '/',
    secure: false,
    value: 'ADyxukvbk5kii_INA6iQVFHqiKhkVmXIEmhLczPE-VgDukMsglSo85OurusKlfBkur7VHuqq0Be6R0iqFm2vLdeYFfQCTSd0hJc9hW4Tib4-yZNMY69a0lk'
};

doubleClickCookie2 = {
    domain: '.doubleclick.net',
    expires: '2019-03-08T12:47:40.447Z',
    httponly: false,
    name: 'IDE',
    path: '/',
    secure: false,
    value: 'AHWqTUnc1rl48ZejsLz-R47c39uURwsQU6A397laiIyh9F0qD0yq4wodYA'
};

doubleClickCookie3 = {
    domain: '.doubleclick.net',
    expires: '2019-03-08T12:47:34.884Z',
    httponly: false,
    name: 'id',
    path: '/',
    secure: false,
    value: '27b2c8c0bf50b9ef||t=1488977248|et=730|cs=002213fd4831ba9490988d24ff'
};


phantom.addCookie(monadsCookie);
phantom.addCookie(monadsCookie2);
phantom.addCookie(monadsCookie3);
phantom.addCookie(monadsCookie4);

phantom.addCookie(doubleClickCookie1);
phantom.addCookie(doubleClickCookie2);
phantom.addCookie(doubleClickCookie3);









page.onConsoleMessage = function(msg) {
    console.log(msg);
};
// page.onResourceRequested = function (request) {
//     console.log('= onResourceRequested()');
//     console.log('  request: ' + JSON.stringify(request, undefined, 4));
// };
//
// page.onResourceReceived = function(response) {
//     console.log('= onResourceReceived()' );
//     console.log('  id: ' + response.id + ', stage: "' + response.stage + '", response: ' + JSON.stringify(response));
// };
//
// page.onLoadStarted = function() {
//     console.log('= onLoadStarted()');
//     var currentUrl = page.evaluate(function() {
//         return window.location.href;
//     });
//     console.log('  leaving url: ' + currentUrl);
// };



// page.onNavigationRequested = function(url, type, willNavigate, main) {
//     console.log('= onNavigationRequested');
//     console.log('  destination_url: ' + url);
//     console.log('  type (cause): ' + type);
//     console.log('  will navigate: ' + willNavigate);
//     console.log('  from page\'s main frame: ' + main);
// };
//
page.onResourceError = function(resourceError) {
    console.log('= onResourceError()');
    console.log('  - unable to load url: "' + resourceError.url + '"');
    console.log('  - error code: ' + resourceError.errorCode + ', description: ' + resourceError.errorString );
};

page.onResourceTimeout = function(resourceError) {
    console.log('= onResourceTimeout()');
    console.log('  - unable to load url: "' + resourceError.url + '"');
    console.log('  - error code: ' + resourceError.errorCode + ', description: ' + resourceError.errorString );
};

page.onError = function(msg, trace) {
    console.log('= onError()');
    var msgStack = ['  ERROR: ' + msg];
    if (trace) {
        msgStack.push('  TRACE:');
        trace.forEach(function(t) {
            msgStack.push('    -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    console.log(msgStack.join('\n'));
};




page.onLoadFinished = function() {
    //     console.log("---------starting");
        // Get all the aswift iframe names
        // var aswiftIframes = page.evaluate(function() {
        //     // var test = document.querySelectorAll('[data-original-click-url]');
        //     var adsElems = [];
        //     var iframes = document.getElementsByTagName('iframe');
        //     for (var i = 0; i < iframes.length; i++) {
        //         if(iframes[i].name.indexOf('aswift') !== -1) {
        //             adsElems.push(iframes[i].name);
        //         }
        //     }
        //     return adsElems;
        // });
        // var counter = 0;



};


page.open('http://monadsproject.com/', function(status) {
// page.open('https://eb.dk/', function(status) {
    console.log("status: " + status);



    setTimeout(function () {
        console.log("---------------inside timeout function");

        // page.switchToMainFrame();
        // page.switchToChildFrame('aswift_2'); // e.g. aswift_0
        // page.switchToChildFrame('google_ads_frame3'); // google_ads frames have number of aswift +1
        // page.switchToChildFrame('ad_iframe');
        // page.switchToFrame(0);
        // page.switchToChildFrame('ad_frame');

        console.log("child frames count: " + page.childFramesCount());

        // Typical img add: aswift_n -> google_ads_frame<n> -> ad_iframe -> a tag
        var imageAdLinks = page.evaluate(function() {
            var frames = this.window.frames;

            var result = { 'aTags': [], 'somethingelse': []};
            
            for(var index = 0; index < frames.length; index++) {
                if (frames[index].name.indexOf('aswift') !== -1) {
                    var aswiftNFrames = frames[index].window.frames;
                    for(var index2 = 0; index2 < aswiftNFrames.length; index2++) {
                        if (aswiftNFrames[index2].name.indexOf('google_ads') !== -1) {
                            var googleAdFrames = aswiftNFrames[index2].window.frames;

                            // Go through google_ad_frame_n iframe's <a> tags, often the ad is here with id aw0
                            var aTags = aswiftNFrames[index2].window.document.getElementsByTagName("a");
                            for(var tagIndex = 0; tagIndex < aTags.length; tagIndex++) {
                                if (aTags[tagIndex].href.indexOf('//www.googleadservices') !== -1) {
                                    result['aTags'].push(aTags[tagIndex].outerHTML);
                                    continue;
                                }
                                if (aTags[tagIndex].id == 'aw0') {
                                    result['aTags'].push(aTags[tagIndex].outerHTML);
                                    continue;
                                }
                                if (aTags[tagIndex].id == 'adContent-clickOverlay') {
                                    result['aTags'].push(aTags[tagIndex].outerHTML);
                                }
                            }

                            // Go through the next layer, sometimes the ad is in the next iframe
                            for(var index3 = 0; index3 < googleAdFrames.length; index3++) {
                                if (typeof googleAdFrames[index3].window.name !== 'undefined') {
                                    if (googleAdFrames[index3].window.name.indexOf('google_ad') !== -1) {
                                        console.log("yeah");
                                    }

                                    if (googleAdFrames[index3].window.name.indexOf('ad_iframe') !== -1) {
                                        var aTags2 = googleAdFrames[index3].window.document.getElementsByTagName("a");
                                        for(var tagIndex2 = 0; tagIndex2 < aTags2.length; tagIndex2++) {
                                            if (aTags2[tagIndex2].href.indexOf('//www.googleadservices') !== -1) {
                                                result['aTags'].push(aTags2[tagIndex2].outerHTML);
                                                continue;
                                            }
                                            if (aTags2[tagIndex2].id == 'aw0') {
                                                result['aTags'].push(aTags2[tagIndex2].outerHTML);
                                                continue;
                                            }
                                            if (aTags2[tagIndex2].id == 'adContent-clickOverlay') {
                                                result['aTags'].push(aTags2[tagIndex2].outerHTML);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return result;
        });

        if (imageAdLinks) {
            console.log("Appending image ad links to imageAdLinks.txt");
            fs.write('imageAdLinks.txt', JSON.stringify(imageAdLinks) + '\n', 'a');
        }
        page.render('monadsproject.png');
        phantom.exit();
    }, 10000);

    // console.log(page.frameName);
    // page.render('monadsproject.png');
});

