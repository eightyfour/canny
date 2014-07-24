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
    "use strict";
    var async = (function () {
        var filesToLoad = [],
            ready = false,
            fc = {
                appendScript : function (script, cb) {
                    var node = document.createElement('script');
                    node.type = "text/javascript";
                    node.async = true;
                    node.setAttribute('src', script.getAttribute('src'));
                    node.addEventListener('load', cb, false);
                    document.head.appendChild(node);
                },
                appendScriptsToHead : function (scripts, cb) {
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
                            fc.appendScript(script, scriptCounter.ready);
                        } else {
                            console.warn('async: found inline script tag!!!');
                        }
                    }

                    if (scripts.length === 0 || includesScripts === false) {
                        cb();
                    }

                },
                doAjax : function (params) {
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
                    call.open(params.method, url, true);
                    call.onreadystatechange = function () {
                        if (call.readyState != 4 || call.status != 200) {
                            if (params.onFailure) {
                                params.onFailure(call);
                            }
                        } else {
                            if (params.onSuccess) {
                                params.onSuccess(call)
                            }
                        }
                    };
                    call.setRequestHeader(params.contentType || "Content-Type", params.mimeType || "text/plain");
                    if (params.method === 'POST') {
                        call.send(params.data);
                    } else {
                        call.send();
                    }
                },
                loadHTML: function (node, attr, cb) {
                    var div = document.createElement('div'),
                        scripts,
                        // only parse if html and scripts are loaded (scripts has callbacks because there are needs to loaded asynchronous)
                        handleCannyParse = (function (cb) {
                            var waitForScripts = true,
                                waitForHTML = true,
                                triggger = function () {
                                    if (!waitForScripts && !waitForHTML) {
                                        canny.cannyParse(node, cb); // init also canny own modules
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
                        }(cb));
                    modViews.load(attr.url, function (src) {
                        var childs;
                        if (src) {
                            div.innerHTML = src;
                            scripts = div.getElementsByTagName('script');
                            childs = [].slice.call(div.childNodes);
                            fc.appendScriptsToHead(scripts, handleCannyParse.scriptReady);
                            childs.forEach(function (child) {
                                if (!(child.tagName === 'SCRIPT' && child.getAttribute('src'))) {
                                    node.appendChild(child);
                                }
                            });
                            handleCannyParse.htmlReady();
                        } else {
                            console.warn('async: Loading async HTML failed');
                        }
                    });
                }
            },
            pushLoadCBs = [],
            modViews = {
                ready: function () {
                    var obj, cbCount = filesToLoad.length;
                    while (filesToLoad.length > 0) {
                        obj = filesToLoad.splice(0, 1)[0];
                        fc.loadHTML(obj.node, obj.attr, function () {
                            cbCount--;
                            if (cbCount <= 0) {
                                while (pushLoadCBs.length > 0) {
                                    pushLoadCBs.splice(0, 1)[0]();
                                }
                            }
                        });
                    }

                },
                pushLoadCB : function (fc) {
                    pushLoadCBs.push(fc);
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
                doAjax: fc.doAjax,
                loadHTML : fc.loadHTML,
                /**
                 * Deprecated: use loadHTML instead
                 * @param path
                 * @param cb
                 */
                load: function (path, cb) {
                    fc.doAjax({
                        method: 'GET',
                        path: path,
                        onSuccess: function (response) {
                            cb(response.responseText);
                        }
                    });
                }
            };

        return modViews;
    }());
    // export as module or bind to global
    if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
        module.exports = async;
    } else {
        canny.add('async', async);
    }

}());

