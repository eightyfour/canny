/*global */
/*jslint browser: true*/
(function (global) {
    "use strict";
    var canny = (function () {
            var readyQueue = [],
                callReadQueue = function () {
                    (function reduce() {
                        var fc = readyQueue.pop();
                        if (fc) {
                            fc();
                            reduce();
                        } else {
                            readyQueue = null;
                        }
                    }());
                },
                parseNode = function (node, name, cb) {
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

            document.addEventListener('DOMContentLoaded', function cannyDomLoad () {
                document.removeEventListener('DOMContentLoaded', cannyDomLoad);

                parseNode.apply(canny, [document, 'canny']);
                // find solution for calling ready...
                Object.keys(canny).forEach(function (module) {
                    //  todo save all new registered objects and call there after appending all.
                    if (canny[module].hasOwnProperty('ready')) {
                        canny[module].ready();
                    }
                });
                // call canny reader queue
                callReadQueue();
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
                    parseNode.apply(this || canny, [node, name || 'canny', cb || function () {}]);
                }
            };
        }()),
        module;
    // export as module or bind to global
    if (module) { module.exports = canny; } else {global.canny = canny; }
}(this));