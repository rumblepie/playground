function loginToGoogleAsync(self, username, password, numTry) {
    var loginButtonFound;
    var wasRecursive = false;
    self.echo('Google login try number: ' + numTry);

    if (numTry > 6) {
        self.echo('Tried to login to Google 3 times, did not work');
        self.exit(1);
    }

    self.thenOpen("http://www.gooogle.com", function() {
        self.echo("Opened google.com");
        self.wait(8000);
    });

    self.then(function() {
        self.evaluate(function() {
            var aTags = document.querySelectorAll('a');
            for(var i = 0; i < aTags.length; i++) {
                var text = aTags[i].innerText;

                if(text.indexOf("Log ind") > -1 || text.indexOf("Accedi") > -1 || text.indexOf("Login") > -1) {
                    console.log("Found login button!");
                    aTags[i].setAttribute('sboClicker', 'clickME!');
                    // aTags[i].click();
                    return;
                }
            }
        });
    });

    self.then(function() {
        self.wait(8000);

        self.thenClick('a[sboClicker="clickME!"]', function() {
            self.echo('Clicked login button!')
        });

        self.then(function() {
            self.fillSelectors(
                'form[role="presentation"]',
                { 'input[type=email]': username },
                false
            );
        });

        self.then(function() {
            self.wait(12000, function() {
                self.capture('renderings/_loginProcess_0.png');
            });
        });

        self.then(function() {
            self.evaluate(function() {
                document.querySelector('div[id="identifierNext"]').click();
            });

        });

        self.then(function() {
            self.capture('renderings/_loginProcess_1.png');
            self.wait(10000, function() {
                self.capture('renderings/_loginProcess_2.png');
            });
        });

        self.then(function() {
            var pwSelector = 'form[action="/signin/v2/challenge/password/empty"]';
            if (self.exists(pwSelector)) {
                self.fillSelectors(
                    pwSelector,
                    { 'input[type=password]': password },
                    false
                );
            } else {
                self.wait(5000, function() {
                    if (self.exists(pwSelector)) {
                        self.fillSelectors(
                            pwSelector,
                            { 'input[type=password]': password },
                            false
                        );
                    } else {
                        loginToGoogleAsync(self, username, password, numTry + 1);
                        self.then(function() {
                            wasRecursive = true;
                        });
                    }
                });

            }
        });

        self.then(function() {
            if (!wasRecursive) {
                self.wait(5000, function() {
                    self.capture('renderings/_loginProcess_3.png');
                });
            }
        });

        self.then(function() {
            if (!wasRecursive) {
                self.capture('renderings/_loginProcess_4.png');
                if (self.exists('div[id="passwordNext"]')) {
                    self.evaluate(function() {
                        document.querySelector('div[id="passwordNext"]').click();
                    });
                    self.then(function() {
                        self.wait(5000, function() {
                            self.capture('renderings/_loginProcess_5.png');
                        });
                    });
                } else {
                    loginToGoogleAsync(self, username, password, numTry + 1);
                    self.then(function() {
                        wasRecursive = true;
                    });
                }
            }
        });

        self.then(function() {
            self.open('http://google.com');
            self.then(function() {
                self.capture('renderings/_login_on_google.png');
            });
        });
    });
};

module.exports.loginToGoogleAsync = loginToGoogleAsync;