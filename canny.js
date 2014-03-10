/*global */
/*jslint browser: true*/

// todo Create own async canny mod

var domready = require('domready');

var canny = (function () {
    "use strict";

    console.log('INITIALIZE CANNY MODULE');

    var parseNode = function (node, name, cb) {
        var that = this, gdModuleChildren = [].slice.call(node.querySelectorAll('[' + name + '-mod]'));

        gdModuleChildren.forEach(function (node) {
            var attribute = node.getAttribute(name + '-mod'), attr, viewPart, attributes, cannyVar;

            attributes = attribute.split(' ');

            attributes.forEach(function (eachAttr) {
                if (that.hasOwnProperty(eachAttr)) {
                    if (node.getAttribute(name + '-mod')) {
                        cannyVar = node.getAttribute(name + '-var');
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
                    that[eachAttr].add(node, viewPart);
                }
            });
        });
        cb && cb();
    };

    domready(function () {
        parseNode.apply(canny, [document, 'canny']);
        // find solution for calling ready...
        Object.keys(canny).forEach(function (module) {
//  todo save all new registered objects and call there after appending all.
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
        cannyParse : function (node, name, cb) {
            // TODO needs a callback
            if (typeof name === 'function') {
                cb = name;
                name = "canny";
            }
            parseNode.apply(this || canny, [node, name, cb || function () {}]);
        }
    };
}());


module.exports = canny;
