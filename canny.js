/*global */
/*jslint browser: true*/
/**
 *
 * E.g.:
 *  canny-mod="moduleObj" canny-var="{'propertyKey':'value'}"
 *  canny-mod="moduleString" canny-var="button"
 *
 * Instead of canny-var you can use the module name to avoid conflicts like:
 * E.g.: canny-mod="mod1 mod2" canny-mod1={'foo':'123456', 'bar':'654321'} canny-mod2="mod2Property"
 *
 * ---------------------------------------------------------------------------- eightyfour
 */
(function (global) {
    "use strict";
    var canny = (function () {
        var readyQueue = [],
            readyQueueInit = false,
            moduleQueue = []; // save modules to call the ready method once

        /**
         * Find the single quotes and replace them with double quotes except string which
         * are part of the property string.
         *
         * @param string
         * @returns {string}
         */
        function escapeStringForJSON(string) {
            var s = string
                .replace(/{\s*?\'/g,'{"').replace(/\'\s*?}/g,'"}')
                .replace(/:\s*?\'/g,':"').replace(/\'\s*?:/g,'":')
                .replace(/,\s*?\'/g,',"').replace(/\'\s*?,/g,'",');
            return s;
        }

        function callMethodQueue(queue) {
            (function reduce() {
                var fc = queue.pop();
                if (fc) {
                    fc();
                    reduce();
                } else {
                    queue = [];
                }
            }());
        }

        function parseNode(node, name, cb) {
            var that = this, gdModuleChildren = [].slice.call(node.querySelectorAll('[' + name + '-mod]')), prepareReadyQueue = {};

            gdModuleChildren.forEach(function (node) {
                var attribute = node.getAttribute(name + '-mod'), attr, viewPart, attributes, cannyVar;

                attributes = attribute.split(' ');

                attributes.forEach(function (moduleName) {
                    if (that[moduleName]) {
                        if (node.getAttribute(name + '-mod')) {
                            if (node.getAttribute(name + '-' + moduleName)) {
                                cannyVar = node.getAttribute(name + '-' + moduleName);
                            } else {
                                cannyVar = node.getAttribute(name + '-var');
                            }
                            if (cannyVar) {
                                // simple JSON test
                                if (/{\s*?\'.*:.*}/.test(cannyVar)) {
                                    attr = escapeStringForJSON(cannyVar);
                                    // could be a JSON
                                    try {
                                        viewPart = JSON.parse(attr);
                                    } catch (ex) {
                                        console.error("canny can't parse passed JSON for module: " + moduleName, node);
                                    }
                                } else {
                                    viewPart = cannyVar;
                                }
                            }
                        }
                        // has module a ready function than save it for calling
                        if (that[moduleName].hasOwnProperty('ready')) {
                            // TODO or call it immediately?
                            prepareReadyQueue[moduleName] = that[moduleName].ready;
                        }
                        if (that.hasOwnProperty(moduleName)) {
                            that[moduleName].add(node, viewPart);
                        }
                    } else {
                        console.warn('canny parse: module with name ´' + moduleName + '´ is not registered');
                    }
                });
            });
            // add ready callback to moduleQueue
            Object.keys(prepareReadyQueue).forEach(function (name) {
                moduleQueue.push(prepareReadyQueue[name]);
            });
            cb && cb();
        }

        document.addEventListener('DOMContentLoaded', function cannyDomLoad() {
            document.removeEventListener('DOMContentLoaded', cannyDomLoad);

            parseNode.apply(canny, [document, 'canny']);

            callMethodQueue(moduleQueue);
            // call registered ready functions
            readyQueueInit = true;
            callMethodQueue(readyQueue);
        }, false);

        return {
            add : function (name, module) {
                var moduleApi = module;
                if (!this.hasOwnProperty(name)) {
                    if (typeof module === 'function') {
                        moduleApi = module(this); // initialize the module with the actual canny instance
                    }
                    this[name] = moduleApi;
                } else {
                    console.error('canny: Try to register module with name ' + name + ' twice');
                }
            },
            ready : function (fc) {
                if (!readyQueueInit) {
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
                    callMethodQueue(moduleQueue);
                    cb && cb();
                }]);
            }
        };
    }());
    // export as module or bind to global
    if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) { module.exports = canny; } else {global.canny = canny; }
}(this));
