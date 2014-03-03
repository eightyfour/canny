/*global */
/*jslint browser: true*/

/**
 * E.g.: gd-module="flowControl" gd-attr="{'view' : 'viewToShow'}"
 *
 */
var async = (function () {
    "use strict";

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

module.exports = async;
