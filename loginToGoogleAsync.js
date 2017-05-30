function loginToGoogleAsync(self, username, password) {
    var loginButtonFound;

    self.thenOpen("http://www.gooogle.com", function() {
        self.echo("Opened google.com");
        self.wait(3000);
    });

    self.then(function() {
        self.evaluate(function() {
            var aTags = document.querySelectorAll('a');
            for(var i = 0; i < aTags.length; i++) {
                var text = aTags[i].innerText;

                if(text.indexOf("Log ind") > -1 || text.indexOf("Accedi") > -1 || text.indexOf("Login") > -1) {
                    console.log("Found login button!");
                    aTags[i].click();
                    return;
                }
            }
        });
    });

    self.then(function() {
        self.wait(3000);

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
                self.echo('Could not find password form');
                self.exit(1);
            }
        });

        self.then(function() {
            self.wait(2000, function() {
                self.capture('renderings/_loginProcess_3.png');
            });
        });

        self.then(function() {
            self.capture('renderings/_loginProcess_4.png');
            self.thenClick('div[id="passwordNext"]', function() {
                self.wait(2000, function() {
                    self.capture('renderings/_loginProcess_5.png');
                });
            });
        });
    });
};

module.exports.loginToGoogleAsync = loginToGoogleAsync;