/*global canny */
/*jslint browser: true */
/**
 * easy access to standard URL parameters:
 * * read anchors
 * * get request parameter from the URL
 */
canny.add('url', (function () {
    'use strict';

    return {
        /**
         * Read Anchors passed by a hash (#)
         * Will be returned as array - hashes could be separated by comma (,)
         * @returns {[]}
         */
        getViewAnchors : function (delimiter) {
            var hash = location.hash || null, hashSub;
            if (hash) {
                hashSub = hash.substr(1);
                return hashSub.split(delimiter || ',');
            }
            return hash;
        },
        /**
         * Read URL GET parameters.
         * If value is not set the parameter can still be used as a boolean flag (example.html?activate)
         * @param name
         * @param url
         * @returns {string} or {false}
         */
        getURLParameter : function (name, url) {
            if (!url) {url = document.location.search; }
            var value = decodeURIComponent((new RegExp(name + '=' + '(.+?)(&|$)').exec(url) || [undefined, ''])[1]);
            if (value.length === 0) {
                value = (new RegExp('[?|&]' + name + '(?:[=|&|#|;|]|$)', 'i').exec(url) !== null);
            }
            return value;
        }
    };
}()));
