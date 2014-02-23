/*global */
/*jslint browser: true*/
var domready = require('domready');

var canny = (function () {
    "use strict";

    console.log('INITIALIZE CANNY MODULE');

    domready(function () {

        var gdModules = function () {
            var gdModuleChildren = [].slice.call(document.querySelectorAll('[canny-mod]'));

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
        };

        gdModules();
        Object.keys(canny).forEach(function(module) {
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
        }
    };
}());


module.exports = canny;