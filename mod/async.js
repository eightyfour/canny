/*global canny */
/*jslint browser: true*/

/**
 * E.g.:
 * canny.async.load(URL, function (src) {
 *     node.innerHTML = src;
 *     // trigger canny parse to register canny on our new modules
 *     canny.cannyParse(node, function () {
 *         console.log('CANNY PARSE DONE');
 *     });
 * });
 *
 */
(function () {
    "use strict";
    var async = (function () {
        var filesToLoad = [],
            ready = false,
            fc = {
                loadHtml: function (c) {
                    var r = new XMLHttpRequest();
                    r.open(c.method, c.path, true);
                    r.onreadystatechange = function () {
                        if (r.readyState != 4 || r.status != 200) {
                            c.cb(false);
                        } else {
                            console.log('Success: ' + r.responseText);
                            c.cb(r.responseText);
                        }
                    };
                    r.send(c.param);
                },
                loadHTML: function (node, attr) {
                    modViews.load(attr.url, function (src) {
                        if (src) {
                            node.innerHTML = src;
                            canny.cannyParse.apply(canny.loginForm, [node, 'form']);
                            canny.cannyParse(node); // init also canny own modules
                        } else {
                            console.error('Loading async HTML failed');
                        }
                    });
                }
            },
            modViews = {
                ready: function () {
                    console.log('async is ready');
                    filesToLoad.forEach(function (obj) {
                        fc.loadHTML(obj.node, obj.attr);
                    });
                },
                add: function (node, attr) {    // part of api
                    // TODO implement logic for loading it directly from html
                    if (attr.hasOwnProperty('url')) {
                        if (!ready) {
                            filesToLoad.push({
                                node: node,
                                attr: attr
                            });
                        } else {
                            fc.loadHTML(node, attr);
                        }

                    }
                },
                load: function (path, cb) {
                    fc.loadHtml({
                        method: 'GET',
                        path: path,
                        param: '',
                        cb: cb || function () {
                        }
                    });
                }
            };

        return modViews;
    }());
    // export as module or bind to global
    if (typeof module !== 'undefined') {
        module.exports = async;
    } else {
        canny.add('async', async);
    }

}());
