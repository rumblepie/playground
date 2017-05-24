module.exports = function(self, username, password) {
    var loginButtonFound;

    self.thenOpen("http://www.gooogle.com", function() {
        self.echo("Opened google.com");
        self.wait(3000);
    });

    self.then(function() {
        loginButtonFound = self.evaluate(function() {
            var aTags = document.querySelectorAll('a');
            for(var i = 0; i < aTags.length; i++) {
                var text = aTags[i].innerText;

                if(text.indexOf("Log ind") > -1 || text.indexOf("Accedi") > -1 || text.indexOf("Login") > -1) {
                    console.log("Found login button!");
                    aTags[i].setAttribute("sboLoginButton", "findMe");
                    return "true";
                }
            }

            return;
        });
    });

    self.then(function() {
        if (!loginButtonFound) {
            self.echo("Could not find login button");
            self.exit();
        }

        self.thenClick('a[sboLoginButton="findMe"]', function() {
            self.then(function() {
                self.fillSelectors(
                    'form[role="presentation"]',
                    { 'input[type=email]': username },
                    false
                );
            });

            self.then(function() {
                self.wait(8000, function() {
                    self.capture('renderings/_loginProcess_0.png');
                });
            });

            self.then(function() {
                self.thenClick('div[id="identifierNext"]', function() {
                    self.capture('renderings/_loginProcess_1.png');
                    self.wait(10000, function() {
                        self.capture('renderings/_loginProcess_2.png');
                    });
                });
            });

            self.then(function() {
                self.fillSelectors(
                    'form[action="/signin/v2/challenge/password/empty"]',
                    { 'input[type=password]': password },
                    false
                );
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
    });
};


