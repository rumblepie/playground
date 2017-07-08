var self = require('casper');

var casper = require('casper').create({
    // logLevel: "debug",
    debug:true,
    waitTimeout: 15000,
    stepTimeout: 15000,
    verbose: true,
    viewportSize: {
        width: 1400,
        height: 1024
    },
    exitOnError: false,
    pageSettings: {
        // "userAgent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        "userAgent": 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.10 (KHTML, like Gecko) Chrome/23.0.1262.0 Safari/537.10',
        // "userAgent": 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/538.1 (KHTML, like Gecko) Safari/538.1',
        // "userAgent": 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/538.1 (KHTML, like Gecko) CasperJS/1.1.4+PhantomJS/2.1.1 Safari/538.1',
        // "userAgent": 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:53.0) Gecko/20100101 Firefox/53.0',
        "loadImages": true,
        "webSecurityEnabled": false,
        "ignoreSslErrors": true
    },
    onWaitTimeout: function() {
        this.echo("A timeout occured through waitTimeout");
    },
    onStepTimeout: function() {
        this.echo("A timeout occured through stepTimeout");
    }
});

// Helpful debugging settings
casper.on('remote.message', function(msg) {
    this.echo('Page console: ' + msg);
});

casper.on("page.error", function(msg, trace) {
    this.echo("Page error: " + msg, "ERROR");
});

// External
var fs = require('fs');
var utils = require('utils');
var x = require('casper').selectXPath;

// Internal
var getAds = require("commonUtils").getAds;
var findAd = require("commonUtils").findAd;
var addZero = require("profileBuilderUtils").addZero;
var loginToGoogleAsync = require("loginToGoogleAsync").loginToGoogleAsync;
var verifyActivityHistoryAsync = require("profileBuilderUtils").verifyActivityHistoryAsync;
var clickLinksAsync = require("profileBuilderUtils").clickLinksAsync;
var searchGoogleAndFollowLinkAsync = require("profileBuilderUtils").searchGoogleAndFollowLinkAsync;
var getTopics = require('getTopics').getTopics;
var readCookies = require('commonUtils').readCookies;
var squashRecords = require('commonUtils').squashRecords;
var buildProfileAsync = require('buildProfileAsync').buildProfileAsync;
var filterAdvertisement = require('filterAdvertisement').filterAdvertisement;
var filterAdRecords = require('filterAdvertisement').filterAdRecords;

// CLI checks
var profiles = casper.cli.get('profiles');
if (!profiles) {
    casper.echo('You must supply a --profile');
    casper.exit(1);
} else {
    if (!fs.exists(profiles)) {
        casper.echo('Could not find the profiles file');
        casper.exit(1);
    }

    profiles = JSON.parse(fs.read(profiles));
}


var dang = {
    "start": "16:44",
    "links": [
        "http://startpage.lenovo.com/news/read/category/news/article/the_associated_press-us_marks_independence_day_with_pomp_dazzle_hot_dog-ap",
        "http://startpage.lenovo.com/news/read/article/the_associated_press-the_latest_finally_gulbis_gets_1st_win_in_more_tha-ap",
        "http://startpage.lenovo.com/news/read/category/news/article/the_associated_press-us_marks_independence_day_with_pomp_dazzle_hot_dog-ap",
        "http://startpage.lenovo.com/player/category/movies/article/watchmojo-another_top_10_movies_that_ruined_the_directors_re-watchmojo",
        "http://startpage.lenovo.com/news/read/article/the_associated_press-poland_moves_toward_extradition_of_us_man_in_nazi-ap",
        "https://www.yahoo.com/tv/",
        "https://groups.yahoo.com/",
        "https://www.yahoo.com/gma/isnt-woman-speaks-her-hotel-reservation-cancelled-no-121505120--abc-news-travel.html",
        "https://beap.gemini.yahoo.com/mbclk?bv=1.0.0&es=uB5DoyIGIS_afonU3Gmn1zsy0nGWMFO_5.QCsSiZBGC_2TtPPM6sptF_rl_lnym7CILwN5oMuQJWwsUE7RtILIdKn.Hd_rJ4jWsFYa2AH.wy_TbP4euQR8T_IXhaVtF3suZZIIBdX2934bBH.QYDFPdP3sH8Tnd_JY5DWcFTYqH4R0XHnNEodnnf6RpCVVuR8eJ7KAeVdqCU_cVy5YaroyzPygl2YCJ7tygk5IugLVfUeDtKJXCjZBAhq5SjTHSNpLL3wcYojdQIguUd7.DBfqttH5czU5xQWHlv36qKCGxpmVJ_nJKBYAGzzHMwYOVvyOlteQX8opw1qxcyTcGad0XsNX.VlTX1z9xHIxXIHFNscWRbwD_.4dALC1KZeG5WpJKZ_krL4wrJItWNSIn2UOeEuHQGGYgXZ0IugXK7d3_Y4DQ2uzRxuBGoerjP07urcqwz0dqTzTioYyDwmqx4Td5tY5GdDmJCXFz7YAHbbT24ReiLa.1uD6BbT8cTsTFfSz90rkCsqp66xLy3rb3SuF4nv4EJzlCy6WrKBaY6TiFxIveiNGQZ1UF06XW5kM1KtypCi.Yl9BNdccUJKQ--%26lp=http%3A%2F%2Fapi.avidadserver.com%2Fapi%2FAsms%2Fclick%3Ftid%3D5582ef2a1ee0530758383c1f%26clid%3D570e9fb91ee0530a10a6ec2d%26p%3D1%26sid1%3D31997007572",
        "https://www.yahoo.com/gma/celebs-share-fourth-july-wishes-170103790--abc-news-celebrities.html",
        "http://discountcode.dailymail.co.uk/",
        "http://discountcode.dailymail.co.uk/thomson",
        "http://discountcode.dailymail.co.uk/debenhams",
        "http://discountcode.dailymail.co.uk/groupon",
        "http://discountcode.dailymail.co.uk/",
        "https://www.reddit.com/r/LifeProTips/",
        "https://www.reddit.com/r/thisismylifenow/comments/6ldeg5/looks_like_im_one_of_them_now/",
        "https://www.reddit.com/r/CNNmemes/comments/6ld4w4/begun_the_meme_war_has/",
        "https://www.reddit.com/r/gadgets/",
        "https://www.reddit.com/r/Music/",
        "//imgur.com/tos",
        "https://imgur.com/signin?invokedBy=regularSignIn",
        "//imgur.com/upload",
        "//help.imgur.com/hc/en-us",
        "//imgur.com/memegen",
        "https://9gag.com/comic",
        "https://9gag.com/school",
        "https://9gag.com/trending",
        "https://9gag.com/gag/aB8Kdn1?ref=fsidebar",
        "http://9gag.com/iphone"
    ],
    "searches": [
        "startpage.lenovo.com Autos & Vehicles",
        "yahoo.com Autos & Vehicles",
        "dailymail.co.uk Autos & Vehicles",
        "reddit.com Autos & Vehicles",
        "imgur.com Autos & Vehicles",
        "9gag.com Autos & Vehicles"
    ],
    "googleLinks": [
        "http://startpage.lenovo.com/tv/3/player/vendor/Storyful%20Studio/player/fiveminute/asset/storyful_studio-multivehicle_incident_on_interstate_81_outside_tam-5min",
        "https://www.yahoo.com/news/tagged/autos/",
        "http://www.dailymail.co.uk/news/article-4496830/Spate-BMW-car-fires-raising-fear-anger-owners.html",
        "https://www.reddit.com/r/Driverless/",
        "http://imgur.com/r/cars",
        "https://9gag.com/gag/ao0Aj2e/john-jones-auto-courtesy-vehicle-saw-this-today"
    ],
    "bases": [
        "http://startpage.lenovo.com",
        "http://startpage.lenovo.com",
        "http://startpage.lenovo.com",
        "http://startpage.lenovo.com",
        "http://startpage.lenovo.com",
        "http://yahoo.com",
        "http://yahoo.com",
        "http://yahoo.com",
        "http://yahoo.com",
        "http://yahoo.com",
        "http://dailymail.co.uk",
        "http://dailymail.co.uk",
        "http://dailymail.co.uk",
        "http://dailymail.co.uk",
        "http://dailymail.co.uk",
        "http://reddit.com",
        "http://reddit.com",
        "http://reddit.com",
        "http://reddit.com",
        "http://reddit.com",
        "http://imgur.com",
        "http://imgur.com",
        "http://imgur.com",
        "http://imgur.com",
        "http://imgur.com",
        "http://9gag.com",
        "http://9gag.com",
        "http://9gag.com",
        "http://9gag.com",
        "http://9gag.com"
    ],
    "end": "18:06",
    "adRecords": {
        "keys": [
            "https://www.scandichotels.dk/mode-konference-event",
            "https://www.newchic.com/hats-and-caps-4192/p-1146957.html",
            "http://www.faergen.dk/service/priser/samsoefaergen.aspx",
            "http://beautifulskinlab.com/",
            "http://www.oasgames.com/lp/narutoen/lp.php",
            "http://",
            "https://www.newchic.com/wallets-3614/p-1152148.html",
            "http://www.reddit.com/r/bettermentbookclub",
            "https://www.reddit.com/r/sciencehumour",
            "http://www.reddit.com/r/california",
            "https://www.mulesoft.com/lp/whitepaper/api/rising-value-apis/",
            "https://www.reddit.com/r/imaginarydragons",
            "https://www.komplett.dk/kampagne/38104/samsung-tilbehoer",
            "https://www.reddit.com/r/imaginarycolorscapes",
            "https://www.reddit.com/r/tinysubredditoftheday",
            "https://www.reddit.com/r/casualconversation",
            "http://9gag.com/apps",
            "http://notsafeforwork.com/",
            "http://9gag.com/movie-tv"
        ],
        "https://www.scandichotels.dk/mode-konference-event": {
            "basePage": "http://startpage.lenovo.com/news/read/category/news/article/the_associated_press-us_marks_independence_day_with_pomp_dazzle_hot_dog-ap",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/14179632948159404373"
            ],
            "lpu": "https://www.scandichotels.dk/mode-konference-event"
        },
        "https://www.newchic.com/hats-and-caps-4192/p-1146957.html": {
            "basePage": "http://startpage.lenovo.com/news/read/article/the_associated_press-the_latest_finally_gulbis_gets_1st_win_in_more_tha-ap",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/1342019621932736420"
            ],
            "lpu": "https://www.newchic.com/hats-and-caps-4192/p-1146957.html"
        },
        "http://www.faergen.dk/service/priser/samsoefaergen.aspx": {
            "basePage": "http://startpage.lenovo.com/news/read/article/the_associated_press-poland_moves_toward_extradition_of_us_man_in_nazi-ap",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/18077032287266298670"
            ],
            "lpu": "http://www.faergen.dk/service/priser/samsoefaergen.aspx"
        },
        "http://beautifulskinlab.com/": {
            "basePage": "http://startpage.lenovo.com/news/read/article/the_associated_press-poland_moves_toward_extradition_of_us_man_in_nazi-ap",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/6820508142741790650"
            ],
            "lpu": "http://beautifulskinlab.com/"
        },
        "http://www.oasgames.com/lp/narutoen/lp.php": {
            "basePage": "http://startpage.lenovo.com/player/article/storyful_studio-multivehicle_incident_on_interstate_81_outside_tam-5min",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/7878000412220650649"
            ],
            "lpu": "http://www.oasgames.com/lp/narutoen/lp.php"
        },
        "http://": {
            "basePage": "http://www.dailymail.co.uk/home/index.html",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/s0.2mdn.net\\/2501656\\/1498482779883\\/DA_SKYSCRAPER_Banner\\/DA_CF-33_SKYSCRAPER.html"
            ],
            "lpu": "http://"
        },
        "https://www.newchic.com/wallets-3614/p-1152148.html": {
            "basePage": "http://www.dailymail.co.uk/news/article-4496830/Spate-BMW-car-fires-raising-fear-anger-owners.html",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/tpc.googlesyndication.com\\/daca_images\\/simgad\\/3385403949744716693"
            ],
            "lpu": "https://www.newchic.com/wallets-3614/p-1152148.html"
        },
        "http://www.reddit.com/r/bettermentbookclub": {
            "basePage": "https://www.reddit.com/",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/13193750977826655505"
            ],
            "lpu": "http://www.reddit.com/r/bettermentbookclub"
        },
        "https://www.reddit.com/r/sciencehumour": {
            "basePage": "https://www.reddit.com/",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/9791785482299250011"
            ],
            "lpu": "https://www.reddit.com/r/sciencehumour"
        },
        "http://www.reddit.com/r/california": {
            "basePage": "https://www.reddit.com/",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/8465208565757208452"
            ],
            "lpu": "http://www.reddit.com/r/california"
        },
        "https://www.mulesoft.com/lp/whitepaper/api/rising-value-apis/": {
            "basePage": "https://www.reddit.com/r/thisismylifenow/comments/6ldeg5/looks_like_im_one_of_them_now/",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/12345951741832496564"
            ],
            "lpu": "https://www.mulesoft.com/lp/whitepaper/api/rising-value-apis/"
        },
        "https://www.reddit.com/r/imaginarydragons": {
            "basePage": "https://www.reddit.com/",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/2332227160725150870"
            ],
            "lpu": "https://www.reddit.com/r/imaginarydragons"
        },
        "https://www.komplett.dk/kampagne/38104/samsung-tilbehoer": {
            "basePage": "https://www.reddit.com/r/gadgets/",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/s0.2mdn.net\\/4745153\\/kdk_samsung_s8_covers_q217_google_300x250.jpg"
            ],
            "lpu": "https://www.komplett.dk/kampagne/38104/samsung-tilbehoer"
        },
        "https://www.reddit.com/r/imaginarycolorscapes": {
            "basePage": "https://www.reddit.com/",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/6575851681259830635"
            ],
            "lpu": "https://www.reddit.com/r/imaginarycolorscapes"
        },
        "https://www.reddit.com/r/tinysubredditoftheday": {
            "basePage": "https://www.reddit.com/",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/17342200210219457069"
            ],
            "lpu": "https://www.reddit.com/r/tinysubredditoftheday"
        },
        "https://www.reddit.com/r/casualconversation": {
            "basePage": "https://www.reddit.com/r/Music/",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/17910597555399608687"
            ],
            "lpu": "https://www.reddit.com/r/casualconversation"
        },
        "http://9gag.com/apps": {
            "basePage": "https://9gag.com/",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/12061981411957199804",
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/8760220127017566783",
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/7328028142109563172"
            ],
            "lpu": "http://9gag.com/apps"
        },
        "http://notsafeforwork.com/": {
            "basePage": "https://9gag.com/",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/14106685491654640708"
            ],
            "lpu": "http://notsafeforwork.com/"
        },
        "http://9gag.com/movie-tv": {
            "basePage": "https://9gag.com/gag/ao0Aj2e/john-jones-auto-courtesy-vehicle-saw-this-today",
            "farmerTopic": "Autos & Vehicles",
            "resources": [
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/672415820027351625",
                "https:\\/\\/tpc.googlesyndication.com\\/simgad\\/4533213035646510703"
            ],
            "lpu": "http://9gag.com/movie-tv"
        }
    },
    "farmerTopic": "Autos & Vehicles"
};

var __topics;
var __ads;
var __numAds;
var __records;
var __matchesAndDifference;

casper.start('http://localhost:7777');

casper.then(function() {
    var prof = profiles.filter(function(elem) {
         // return elem.email === 'crescente.pisano@lab.imtlucca.it';
         // return elem.email === 'simontravel500@gmail.com';
         // return elem.email === 'kildevaeld500@gmail.com';
         // return elem.email === 'janedoeshopping5660@gmail.com';
         // return elem.email === 'luana.milanesi@lab.imtlucca.it';
         // return elem.email === 'donatella.fallaci@lab.imtlucca.it';
         return elem.email === 'vincenzo.siciliani@lab.imtlucca.it';
    });

    if (casper.cli.get('randomPages')) {
        this.echo("Using " + casper.cli.get('randomPages'));
        prof[0].builtOnPages = JSON.parse(fs.read(casper.cli.get('randomPages'))).topPages;
    }

    var self = this;
    var time = Date.now();

    // var mytest = squashRecords(dang.adRecords);
    // console.log(JSON.stringify(mytest, null, 2));

    buildProfileAsync(this, prof[0], 5, false, function(records, matchesAndDifference) {
        __records = records;
        fs.write('files/' + time + '_' + prof[0].email + '_preFilterPreSquashAds.txt', JSON.stringify(__records, null, 2), 'w');
        __records.adRecords = squashRecords(__records.adRecords);
        __matchesAndDifference = matchesAndDifference;
        fs.write('files/' + time + '_' + prof[0].email + '_preFilterAds.txt', JSON.stringify(__records, null, 2), 'w');
    });

    this.then(function() {
        this.echo(JSON.stringify(__records, null, 2));
        this.echo('Filtering advertisements');
        var self = this;
        filterAdRecords(this, __records.adRecords, function(result) {
        // filterAdRecords(this, dang.adRecords, function(result) {
            // self.echo('filtered advertisements: ');
            // self.echo(JSON.stringify(result, null, 2));
            fs.write('files/' + time + '_' + prof[0].email + '_ads.txt', JSON.stringify(result, null, 2), 'w');
            fs.write('files/_mostRecentAds.txt', JSON.stringify(result, null, 2), 'w');
            self.then(function() {
                self.exit(0);
            });
        });
    });
});


casper.run(function() {
    this.exit();
});


