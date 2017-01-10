/*global canny */
/*jslint browser: true*/

/**
 * Work in progress - don't use this yet:
 *  Will try to reload modules there are not registered on canny.
 *
 *  Only modules which name is the same name as the file name can be loaded.
 *
 *  TODO: require should not parse node which already parsed from canny. Otherwise the
 *  add method is called twice. Means also that click listeners there added in the add
 *  phase a registered more than one.
 *  Maybe call only the add methods from modules there are loaded afterwords.
 */
(function () {
    "use strict";
    var require = (function () {
        var fc = {
                appendScript : function (path, cb) {
                    var node = document.createElement('script');
                    node.type = "text/javascript";
                    node.async = true;
                    node.setAttribute('src', path);
                    node.addEventListener('load', cb, false);
                    node.addEventListener('error', cb, false);
                    document.head.appendChild(node);
                },
                appendScriptsToHead : function (urls, cb) {
                    var path, i, includesScripts = false,
                        scriptCounter = (function () {
                            var count = 0;
                            return {
                                up : function () {count++; },
                                ready : function () {
                                    count--;
                                    if (count <= 0) {
                                        cb();
                                    }
                                }
                            };
                        }());

                    for (i = 0; i < urls.length; i++) {
                        path = urls[i];
                        includesScripts = true;
                        scriptCounter.up();
                        fc.appendScript(path, scriptCounter.ready);
                    }

                    if (urls.length === 0 || includesScripts === false) {
                        cb();
                    }

                },
                searchForNoneRegisteredModules : function (node) {
                    var name = 'canny',
                        query = [].slice.call(node.querySelectorAll('[' + name + '-mod]')),
                        returns = {};
                    query.forEach(function (elem) {
                        var attribute = elem.getAttribute(name + '-mod'), attributes;
                        attributes = attribute.split(' ');
                        // TODO check for empty attributes in case of a space is included at the end of the attribute: canny-mod="moduleName "
                        attributes.forEach(function (attr) {
                            if (!canny.hasOwnProperty(attr)) {
                                returns[attr] = null;
                            }
                        });
                    });
                    return returns;
                },
                getPathNames : function (scriptsObj, path, filePrefix) {
                    var names = Object.keys(scriptsObj),
                        urls = [];
                    names.forEach(function (name) {
                        urls.push(path + '/' + filePrefix + name + '.js');
                    });
                    return urls;
                }
            },
            modViews = {
                add: function (node, attr) {    // part of api
                    // TODO is there no extension load it from canny/mod folder
                    if (attr && attr.hasOwnProperty('ext')) {
                        fc.appendScriptsToHead(
                            fc.getPathNames(
                                fc.searchForNoneRegisteredModules(node),
                                attr.ext,
                                attr.scriptPrefix || ''
                            ),
                            function () {
                                console.log('REQUIRE START CANNY PARSE AGAIN', node);
                                // trigger canny parse because canny can't initialize none registered modules
                                canny.cannyParse(node, function () {
                                    console.log('CANNY FROM REQUIRE IS DONE');
                                }); // init also canny own modules
                            }
                        );

                    }
                    console.log('REQUIRE ADD');
                }
//                loadModule : function (name) {
//                    console.log('LOAD MODULE WITH NAME');
//                }
            };

        return modViews;
    }());
    // export as module or bind to global
    if (typeof module !== 'undefined') {
        module.exports = require;
    } else {
        canny.add('require', require);
    }

}());