function highlight() {
    var content = document.body.innerHTML;
    var regex = '/([\w.]{5})test.com([\w.]{5})/g';
    var matches = content.match(regex);
    console.log("matches");
    console.log(matches);

    var parts = regex.exec(matches[0]);
}

var test2 = test.filter(function(e) {
    if (typeof e == String) {
        if (e.includes('hallahalla')) {
            console.log(e);
            return true
        }
    } else {
        console.log(e.data);
    }
});



var sum = test.reduce(function(cur, next) {
    if (typeof next == String) {
        return cur + next;
    } else {
        return cur + next.data;
    }
}, '');

if ("createEvent" in document) {
    console.log("createEvent is in doc");
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("change", false, true);
    input.dispatchEvent(evt);
}
else {
    console.log("not");
    input.fireEvent("onchange");
}

var button = document.querySelector('#gwt-uid-929');
input.value = "sherdog.com";

var evt = document.createEvent("HTMLEvents");
evt.initEvent("change", true, false);
input.dispatchEvent(evt);

var evt = document.createEvent("HTMLEvents");
evt.initEvent("keypress", true, false);
input.dispatchEvent(evt);


var event = new KeyboardEvent('keydown', {"key": "z", "code": "KeyZ"});
input.dispatchEvent(event);


var event = document.createEvent('Event');
event.initEvent('keyup', true, true);
event.keyCode = 76;
input.dispatchEvent(event);

var event = new Event('change', {"bubbles":true, "cancelable":false, "composed": true});
input.dispatchEvent(event);