/**
 * Created by sbo on 20-03-2017.
 */
var fs = require('fs');
var page = require('webpage').create();
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.37 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36';
page.settings.webSecurityEnabled = false;
page.settings.resourceTimeout = 100000;
page.viewportSize = { width: 1280, height: 1024 };


monadsCookieText = "visit_cookie=true; sc_is_visitor_unique=rx10384643.1490041134.1C0E552364864FDDB26B0A8DBAD24771.5.4.4.4.4.3.3.3.3; _ga=GA1.2.1921956229.1488977255; _gat=1";
monadsCookie = {
    domain: '.monadsproject.com',
    expires: 'Sat Oct 11 2014 21:44:33 GMT+0200 (CEST)',
    expiry: 1476128618,
    httponly: false,
    name: 'c_ga',
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
    value: 'rx10384643.1490041134.1C0E552364864FDDB26B0A8DBAD24771.5.4.4.4.4.3.3.3.3'
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

phantom.addCookie(monadsCookie);
phantom.addCookie(monadsCookie2);
phantom.addCookie(monadsCookie3);
phantom.addCookie(monadsCookie4);











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
    setTimeout(function () {
        console.log("---------starting");
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

        page.evaluate(function() {
          console.log(this.window.name);
        });

        // Go through all iframes inside the aswift iframes
        // for (var y = 0; y < aswiftIframes.length; y++) {
        //     console.log("Switching to " + aswiftIframes[y]);
        //     page.switchToMainFrame();
        //     page.switchToChildFrame(aswiftIframes[y]); // e.g. aswift_0
        //     console.log("Switching to " + 'google_ads_frame' + (y + 1));
        //     page.switchToChildFrame('google_ads_frame' + (y + 1)); // google_ads frames have number of aswift +1
        //     // page.switchToFrame(0);
        //     // page.switchToChildFrame('ad_frame');
        //
        //     console.log("child frames count: " + page.childFramesCount());
        //     // console.log("child frames names: " + page.childFramesName());
        //
        //     var googleAdFrames = page.evaluate(function() {
        //         // var test = document.getElementById('aswift_0').contentWindow.document.getElementById('google_ads_frame1')
        //         //     .contentWindow.document.getElementById('ad_frame');
        //
        //         var test = document.getElementById('ad_iframe');
        //         var nexte;
        //         if(test) {
        //             nexte = test.contentWindow.document.title;
        //         }
        //
        //         // console.log("document.ad iframe: " + nexte);
        //
        //         // var test = document.querySelectorAll('[data-original-click-url]');
        //         console.log("current frame: " + this.window.name);
        //         var innerFrames = document.getElementsByTagName('iframe');
        //         var innerElems = [];
        //
        //         for (var j = 0; j < innerFrames.length; j++) {
        //             console.log("inner: " + innerFrames[j].outerHTML);
        //             if(innerFrames[j].name.indexOf('ad_iframe') !== -1) {
        //                 innerElems.push(innerFrames[j].name);
        //             }
        //         }
        //         return innerElems;
        //     });
        //
        //
        //
        //     for (var googleAdFrame in googleAdFrames) {
        //         console.log("google ad frame name: " + googleAdFrames[googleAdFrame]);
        //     }
        // }



        // page.switchToMainFrame();
        // page.switchToChildFrame('aswift_2'); // e.g. aswift_0
        // // page.switchToChildFrame('google_ads_frame3'); // google_ads frames have number of aswift +1
        // page.switchToFrame(0);
        // page.switchToFrame(0);
        // // page.switchToChildFrame('ad_frame');
        //
        // console.log("child frames count: " + page.childFramesCount());
        // // console.log("child frames names: " + page.childFramesName());
        //
        // var googleAdFrames = page.evaluate(function() {
        //     var test = document.getElementById('ad_iframe');
        //     if(test) {
        //         console.log("document.ad iframe: " + test.contentWindow.document.title);
        //     }
        //
        //
        //     console.log("current frame: " + this.window.name);
        //     var innerFrames = document.getElementsByTagName('iframe');
        //     var innerElems = [];
        //
        //     for (var j = 0; j < innerFrames.length; j++) {
        //         console.log("inner: " + innerFrames[j].outerHTML);
        //         if(innerFrames[j].name.indexOf('ad_iframe') !== -1) {
        //             innerElems.push(innerFrames[j].name);
        //         }
        //     }
        //     return innerElems;
        // });



        // for (var googleAdFrame in googleAdFrames) {
        //     console.log("google ad frame name: " + googleAdFrames[googleAdFrame]);
        // }


        page.render('monadsproject.png');
        console.log("------------ending");
        // phantom.exit();
    }, 5000);
};


page.open('http://monadsproject.com/', function(status) {
    console.log("status: " + status);

    setTimeout(function () {
        console.log("---------------inside timeout function");
        page.switchToMainFrame();
        page.switchToChildFrame('aswift_0'); // e.g. aswift_0
        page.switchToChildFrame('google_ads_frame1'); // google_ads frames have number of aswift +1
        // page.switchToChildFrame('ad_iframe');
        // page.switchToFrame(0);
        // page.switchToChildFrame('ad_frame');

        console.log("child frames count: " + page.childFramesCount());
        // console.log("child frames names: " + page.childFramesName());

        var googleAdFrames = page.evaluate(function() {
            var test = document.getElementById('ad_iframe');
            if(test) {
                console.log("document.ad iframe: " + test.contentWindow.document.title);
            }


            console.log("current frame: " + this.window.name);
            var innerFrames = document.getElementsByTagName('iframe');
            var innerElems = [];

            for (var j = 0; j < innerFrames.length; j++) {
                console.log("inner: " + innerFrames[j].outerHTML);
                if(innerFrames[j].name.indexOf('ad_iframe') !== -1) {
                    innerElems.push(innerFrames[j].name);
                }
            }
            return innerElems;
        });
        phantom.exit();
    }, 5000);

    // console.log(page.frameName);
    // page.render('monadsproject.png');
});

