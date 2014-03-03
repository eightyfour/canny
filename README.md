canny (Beta)
=====

Dom module manager. 

Note: the documentation is not completed because this is work in progress.

Here is an example code how canny works with the **flowControl** and the **async** module:

index.html
```html
<!DOCTYPE html>
<html>
<head>
    <title>canny example</title>
    <script src="main.gen.js"></script>
</head>
<body>
    <H1>hallo kodos</H1>
    <div canny-mod="kodos" canny-var="{'kodos_load': '/async/plain.html'}">Show draft 1</div>
    <br/>
    <div canny-mod="kodos" canny-var="{'kodos_load': '/async/flowControl.html'}">Show draft 2</div>
    <br/>
    <div canny-mod="kodos" canny-var="{'kodos_load': '/async/popup.html'}">Show resultScreenPopup</div>
</body>
</html>
```

Thats all in the index.html. Now let us create the required JavaScript. What you can see in the HTML snippet above we need a canny-mod named **kodos** the name is irrelevant it's just an identifier to register our module which will help us to handle the content.

First of all add the required resources to our main JavaScript file:

```javascript
var canny = require("canny");
// register flowControl
canny.add('flowControl', require('canny/mod/flowControl'));
// register async
canny.add('async', require('canny/mod/async'));
```

Now we need a module named **kodos** which register the click events and trigger the async load call to fill the content with more HTML.

```javascript
canny.add('kodos', (function () {
    "use strict";

    var mod = {
        kodos_show : function (node, value) {
            node.addEventListener('click', function () {
                canny.flowControl.show(value);
            });
        },
        kodos_load : function (node, path) {
            node.addEventListener('click', function click() {
                node.removeEventListener('click', click);
                canny.async.load(path, function (src) {
                    node.innerHTML = src;
                    // trigger canny parse to register canny on our new modules
                    canny.cannyParse(node, function () {
                        console.log('CANNY PARSE DONE');
                    });
                });
            });
        }
    };

    return {
        mod : mod, // part of api
        add : function (node, attr) {    // part of api
            // register simpe click event
            if (attr.hasOwnProperty('kodos_show')) {
                mod.kodos_show(node, attr.kodos_show);
            }
            // register the async functionality
            if (attr.hasOwnProperty('kodos_load')) {
                mod.kodos_load(node, attr.kodos_load);
            }
        },
        ready : function () {
            console.log('KODOS IS INITIALIZED');
        }
    };
}()));
```

And now add a new module named **popup** this file will be initialized when the popup.html is loaded in the dom.

```javascript
canny.add('popup', (function () {
    "use strict";
    var logic = {
            avatar : function (node, slot) {
                node.style.backgroundColor = '#' + slot + slot + slot;
                node.style.width = "100px";
                node.style.height = "100px";
                node.style.float = "left";
                node.style.marginRight = "20px";
                node.style.color = '#fff';

                node.innerHTML = "avatar" + slot;

                return {
                    setText : function (txt) {
                        node.innerHTML = txt;
                    }
                };
            }
        },
        data = {
            avatar1 : function (node) {
                return logic.avatar(node, 1);
            },
            avatar2 : function (node) {
                return logic.avatar(node, 2);
            },
            avatar3 : function (node) {
                return logic.avatar(node, 3);
            },
            avatar4 : function (node) {
                return logic.avatar(node, 4);
            },
            fillDataButton : function (node) {
                node.addEventListener('click', function () {
                    canny.resultScreenPopup.mod().avatar1.setText("You are avatar one");
                    canny.resultScreenPopup.mod().avatar2.setText("You are awesome");
                    canny.resultScreenPopup.mod().avatar3.setText("You are new");
                    canny.resultScreenPopup.mod().avatar4.setText("You're out");
                });
            }
        },
        viewInterface = {};

    return {
        mod : function () {return viewInterface; },
        add : function (node, attr) {    // part of api
            if (data.hasOwnProperty(attr)) {
                viewInterface[attr] = data[attr](node);
            } else {
                console.log('NON EXISTING ATTRIBUTE');
            }
        },
        ready : function () {
            // send code automatical - if code in input
            console.log('popup is ready to use');
        }
    };
}()));
```

Thats all required JavaScript code. Now we have to provide the HTML files in a **async** folder. We need three files for our example.

First the **plain.html** (just to see something)

```html
<div>
    <H1>Draft one example</H1>
    <p>Just plain html</p>
</div>
```

As next the **flowControl.html** too see that the **flowControl** works and canny parse also content which is loaded afterwords.
```html
<H1>Draft 2</H1>
            
<a canny-mod="flowControl kodos" canny-var="{'view' : 'init', 'kodos_show': 'content'}">Hey click here to load content</a>

<div canny-mod="flowControl kodos" canny-var="{'view' : 'content', 'kodos_show': 'init'}" style="display: none">
  <h2>Will be shown after click the link</h2>
</div>
```

And the next one is for the **popup**
```html
<div id="popup">
    <h1>Some avatare</h1>
    <div canny-mod="popup" canny-var="avatar1"></div>
    <div canny-mod="popup" canny-var="avatar2"></div>
    <div canny-mod="popup" canny-var="avatar3"></div>
    <div canny-mod="popup" canny-var="avatar4"></div>
    <h2>And the close button</h2>
    <div canny-mod="popup" canny-var="fillDataButton">fill view with data</div>
</div>
```
