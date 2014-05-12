/*global */
/*jslint browser: true*/
(function (global) {
    "use strict";
    var canny = (function () {
        var readyQueue = [],
            moduleQueue = [], // save modules to call the ready method once
            callMethQueue = function (queue) {
                (function reduce() {
                    var fc = queue.pop();
                    if (fc) {
                        fc();
                        reduce();
                    } else {
                        queue = [];
                    }
                }());
            },
            parseNode = function (node, name, cb) {
                var that = this, gdModuleChildren = [].slice.call(node.querySelectorAll('[' + name + '-mod]'));

                gdModuleChildren.forEach(function (node) {
                    var attribute = node.getAttribute(name + '-mod'), attr, viewPart, attributes, cannyVar;

                    attributes = attribute.split(' ');

                    attributes.forEach(function (eachAttr) {

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
                        // has module a ready function than save it for calling
                        if (that[eachAttr].hasOwnProperty('ready')) {
                            // TODO or call it immediately?
                            moduleQueue.push(that[eachAttr].ready);
                        }
                        if (that.hasOwnProperty(eachAttr)) {
                            that[eachAttr].add(node, viewPart);
                        }
                    });
                });
                cb && cb();
            };

        document.addEventListener('DOMContentLoaded', function cannyDomLoad() {
            document.removeEventListener('DOMContentLoaded', cannyDomLoad);

            parseNode.apply(canny, [document, 'canny']);

            callMethQueue(moduleQueue);
            // call registered ready functions
            callMethQueue(readyQueue);
        }, false);

        return {
            add : function (name, module) {
                if (!this.hasOwnProperty(name)) {
                    this[name] = module;
                } else {
                    console.error('canny: Try to register module with name ' + name + ' twice');
                }
            },
            ready : function (fc) {
                if (readyQueue !== null) {
                    readyQueue.push(fc);
                } else {
                    fc();
                }
            },
            cannyParse : function (node, name, cb) {
                // TODO needs a callback
                if (typeof name === 'function') {
                    cb = name;
                    name = "canny";
                }
                parseNode.apply(this || canny, [node, name || 'canny', function () {
                    callMethQueue(moduleQueue);
                    cb && cb();
                }]);
            }
        };
    }());
    // export as module or bind to global
    if (typeof module !== 'undefined') { module.exports = canny; } else {global.canny = canny; }
}(this));
