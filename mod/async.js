/*global canny */
/*jslint browser: true*/

/**
 * Required: 'canny' in global scope
 *
 * E.g.:
 * canny.async.load(URL, function (src) {
 *     node.innerHTML = src;
 *     // trigger canny parse to register canny on our new modules
 *     canny.cannyParse(node, function () {
 *         console.log('CANNY PARSE DONE');
 *     });
 * });
 *
 * Alternative you can just use loadHTML (scripts will automatically added and parsed by canny):
 * canny.async.loadHTML(node, {url : URL}, function () {
 *     console.log('kodos_load READY');
 * });
 *
 * Or directly as canny module:
 * <div canny-mod="async" canny-var="{'url':'/you/HTML/file.html'}"></div>
 *
 * TODO solve dependency problem to canny.
 *
 */
(function () {
    'use strict';
    var async = (function () {
        var filesToLoad = [],
            pushLoadCBs = [],
            ready = false;

        /**
         *
         * @param script
         * @param mediaURL
         * @param cb
         */
        function appendScript(script, mediaURL, cb) {
            var node = document.createElement('script'),
                src = script.getAttribute('src');
            // handle mediaURL and all relative script are loaded from the media URL string
            if (mediaURL && src[0] !== '/') {
                if (mediaURL[mediaURL.length - 1] !== '/') {
                    mediaURL += '/';
                }
                src = mediaURL + src;
            }
            node.type = "text/javascript";
            node.async = true;
            node.setAttribute('src', src);
            node.addEventListener('load', cb, false);
            node.addEventListener('error', cb, true);
            document.head.appendChild(node);
        }

        /**
         *
         * @param scripts
         * @param mediaURL
         * @param cb
         */
        function appendScriptsToHead(scripts, mediaURL, cb) {
            var script, i, includesScripts = false,
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

            for (i = 0; i < scripts.length; i++) {
                script = scripts[i];
                if (script.getAttribute('src')) {
                    includesScripts = true;
                    scriptCounter.up();
                    appendScript(script, mediaURL, scriptCounter.ready);
                } else {
                    console.warn('async: found inline script tag!!!');
                }
            }

            if (scripts.length === 0 || includesScripts === false) {
                cb();
            }

        }

        /**
         * Parse the complete given DOM and prefix all relative href URL's with the given URL
         * All URL's are handled as relative if there starts not with a / or http:// or https://
         * TODO add support for URL's with a ./ or ../ and so on
         *
         * @param node
         */
        function handleLinks(node, mediaURL) {
            Array.prototype.slice.call(node.getElementsByTagName('link')).forEach(function (link) {
                var href = link.getAttribute('href');
                if (link.getAttribute('type') === 'text/css' && 
                        href !== undefined && 
                        href[0] !== '/' &&
                        !/^http:\/\/.*/.test(href) &&
                        !/^https:\/\/.*/.test(href)) {
                    if (mediaURL[mediaURL.length - 1] !== '/') {
                        mediaURL += '/';
                    }
                    href = mediaURL + href;
                    link.setAttribute('href', href);
                }
            })
        }

        /**
         *
         * @param node
         * @param attr {{url:string}}
         * @param cb
         */
        function loadHTML(node, attr, cb) {
            var div = document.createElement('div'),
                scripts,
                // only parse if html and scripts are loaded (scripts has callbacks because there are needs to loaded asynchronous)
                handleCannyParse = (function (cb) {
                    var waitForScripts = true,
                        waitForHTML = true,
                        triggger = function () {
                            if (!waitForScripts && !waitForHTML) {
                                canny.cannyParse(node, cb); // init only canny own modules
                            }
                        };
                    return {
                        scriptReady : function () {
                            waitForScripts = false;
                            triggger();
                        },
                        htmlReady : function () {
                            waitForHTML = false;
                            triggger();
                        }
                    };
                }(function () {
                    cb(attr);
                }));

            load(attr.url, function (src) {
                var childs;
                if (src) {
                    div.innerHTML = src;
                    scripts = div.getElementsByTagName('script');
                    childs = [].slice.call(div.childNodes);
                    appendScriptsToHead(scripts, attr.mediaURL, handleCannyParse.scriptReady);
                    childs.forEach(function (child) {
                        if (!(child.tagName === 'SCRIPT' && child.getAttribute('src'))) {
                            node.appendChild(child);
                        }
                    });
                    if (attr.mediaURL) {
                        handleLinks(node, attr.mediaURL);
                    }
                    handleCannyParse.htmlReady();
                } else {
                    console.warn('async: Loading async HTML failed');
                }
            });
        }
        /**
         * simple wrapper to load HTML files with GET
         * @param path
         * @param cb
         */
        function load(path, cb) {
            doAjax({
                method: 'GET',
                path: path,
                onSuccess: function (response) {
                    cb(response.responseText);
                }
            });
        }
        /**
         *
         * @param params {{
         *   noCache:boolean,
         *   method:string|POST(default),
         *   data:object|string,
         *   path:string,
         *   async:boolean|true(default),
         *   onRequest:function (will be called with the xmlHTTPRequest object quite close before the send method is called),
         *   onFailure:function,
         *   onSuccess:function,
         *   contentType:string|Content-Type(default),
         *   mimeType:string|text plain(default)
         * }}
         */
         function doAjax(params) {
            var call = new XMLHttpRequest();
            var url = params.path;
            if (params.method === 'GET' && typeof params.data === 'object') {
                for (var attr in params.data) {
                    url = url + ((/\?/).test(url) ? "&" : "?") + attr + "=" + params.data[attr];
                }
            }
            if (params.noCache) {
                url = url + ((/\?/).test(url) ? "&" : "?") + "ts=" + (new Date()).getTime();
            }
            params.method = params.method || 'POST';
            call.open(params.method, url, params.async !== false);
            call.onreadystatechange = function () {
                // TODO use === is this string or number ?
                if (call.readyState == 4) {
                    if (call.status >= 400) {
                        if (params.onFailure) {
                            params.onFailure(call);
                        }
                    } else {
                        if (params.onSuccess) {
                            params.onSuccess(call);
                        }
                    }
                }
            };
            
            call.setRequestHeader(params.contentType || "Content-Type", params.mimeType || "text/plain");

            // allow the caller to do some extra stuff on the request object
            if (params.onRequest && typeof params.onRequest === 'function') {
                params.onRequest(call);
            }
            
            if (params.method === 'POST') {
                call.send(params.data);
            } else {
                call.send();
            }
        }

        return {
            /**
             * add a callback. So you will be notified when files are loaded asynchronous.
             * You will be called only once except your return true then async will keep
             * your callback in the notifier list and you will be informed for each async request.
             *
             * The async module will call each callback with the actual attr. So you have the control
             * how often you will be notified.
             *
             * Might be changed in the future version of async:
             * Currently this is only executed for canny modules which are loaded from the DOM directly.
             *
             * @param fc
             */
            pushLoadCB : function (fc) {
                pushLoadCBs.push(fc);
            },
            /**
             * Do a simple ajax call.
             *
             * @param params {{
             *   noCache:boolean,
             *   method:string|POST(default),
             *   data:object,string,
             *   async:boolean|true(default),
             *   path:string,
             *   onRequest:function (will be called with the xmlHTTPRequest object quite close before the send method is called),
             *   onFailure:function,
             *   onSuccess:function,
             *   contentType:string|Content-Type(default),
             *   mimeType:string|text plain(default)
             * }}
             */
            doAjax: doAjax,
            /**
             *
             * @param node
             * @param attr {{
             *  url:string,
             *  mediaURL:string
             * }}
             * @param cb
             */
            loadHTML : loadHTML,
            /**
             * Deprecated: use loadHTML instead
             * @param path
             * @param cb
             */
            load: function () {
                console.warn('async:load function load is deprecated. Use loadHTML instead');
                load.apply(null, arguments);
            },
            /**
             * canny's add method
             *
             * @param node
             * @param attr
             */
            add: function (node, attr) {    // part of api
                // TODO implement logic for loading it directly from html
                if (attr.hasOwnProperty('url')) {
                    if (!ready) {
                        filesToLoad.push({
                            node: node,
                            attr: attr
                        });
                    } else {
                        loadHTML(node, attr);
                    }
                }
            },
            ready: function () {
                var obj, cbCount = filesToLoad.length;
                while (filesToLoad.length > 0) {
                    obj = filesToLoad.splice(0, 1)[0];
                    loadHTML(obj.node, obj.attr, function (attr) {
                        var keepPushCB = [], tmpCb;
                        cbCount--;
                        while (pushLoadCBs.length > 0) {
                            tmpCb = pushLoadCBs.splice(0, 1)[0];
                            if (tmpCb(attr) === true) {
                                keepPushCB.push(tmpCb);
                            }
                        }
                        pushLoadCBs = keepPushCB;
                    });
                }
            }
        };
    }());
    // export as module or bind to global
    if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
        module.exports = async;
    } else {
        canny.add('async', async);
    }

}());