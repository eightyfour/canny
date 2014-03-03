/*global */
/*jslint browser: true*/

// todo Create own async canny mod

var domready = require('domready');

var canny = (function () {
    "use strict";

    console.log('INITIALIZE CANNY MODULE');

    var parseNode = function (node, cb) {
        var gdModuleChildren = [].slice.call(node.querySelectorAll('[canny-mod]'));

        gdModuleChildren.forEach(function (node) {
            var attribute = node.getAttribute('canny-mod'), attr, viewPart, attributes, cannyVar;

            attributes = attribute.split(' ');

            attributes.forEach(function (eachAttr) {
                if (canny.hasOwnProperty(eachAttr)) {
                    if (node.getAttribute('canny-mod')) {
                        cannyVar = node.getAttribute('canny-var');
                        if (cannyVar) {
                            attr = cannyVar.split("\'").join('\"');
                            if (/:/.test(attr)) {
                                // could be a JSON
                                viewPart = JSON.parse(attr);
                            } else {
                                viewPart = attr;
                            }
                        }
                    }
                    canny[eachAttr].add(node, viewPart);
                }
            });
        });
        cb && cb();
    };

    domready(function () {
        parseNode(document);
        // find solution for calling ready...
        Object.keys(canny).forEach(function(module) {
// todo save all new registered objects and call there after appending all.
            if (canny[module].hasOwnProperty('ready')) {
                canny[module].ready();
            }
        });
    });

    return {
        add : function (name, module) {
            if (!this.hasOwnProperty(name)) {
                this[name] = module;
            } else {
                console.error('canny: Try to register module with name ' + name + ' twice');
            }
        },
        cannyParse : function (node, cb) {
            // TODO needs a callback
            parseNode(node, cb || function () {})
        }
    };
}());


module.exports = canny;