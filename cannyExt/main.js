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
                    canny.popup.mod().avatar1.setText("You are avatar one");
                    canny.popup.mod().avatar2.setText("You are awesome");
                    canny.popup.mod().avatar3.setText("You are new");
                    canny.popup.mod().avatar4.setText("You're out");
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
