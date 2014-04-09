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
            var fc = {
                    loadHtml : function (c) {
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
                    }
                },
                modViews = {
                    ready : function () {console.log('async is ready'); },
                    add : function (node, attr) {    // part of api
                        // TODO implement logic for loading it directly from html
                    },
                    load : function (path, cb) {
                        fc.loadHtml({
                            method: 'GET',
                            path: path,
                            param: '',
                            cb: cb || function () {}
                        });
                    }
                };

            return modViews;
        }());
    // export as module or bind to global
    if (typeof module !== 'undefined') { module.exports = async; } else {canny.add('async', async); }

}());