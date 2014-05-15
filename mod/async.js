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
                handleScriptTags : function (scripts, cb) {
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
                            console.warn('found inline script tag!!!');
                        }
                    }

                    if (scripts.length === 0 || includesScripts === false) {
                        cb();
                    }

                },
                loadHtml: function (c) {
                    var r = new XMLHttpRequest();
                    r.open(c.method, c.path, true);
                    r.onreadystatechange = function () {
                        if (r.readyState != 4 || r.status != 200) {
                            c.cb(false);
                        } else {
                            c.cb(r.responseText);
                        }
                    };
                    r.send(c.param);
                },
                loadHTML: function (node, attr, cb) {
                    var div = document.createElement('div'),
                        scripts;
                    modViews.load(attr.url, function (src) {
                        var childs;
                        if (src) {
                            div.innerHTML = src;
                            scripts = div.getElementsByTagName('script');
                            childs = [].slice.call(div.childNodes);
                            fc.handleScriptTags(scripts, function () {
                                canny.cannyParse(node, cb); // init also canny own modules
                            });
                            childs.forEach(function (child) {
                                if (!(child.tagName === 'SCRIPT' && child.getAttribute('src'))) {
                                    node.appendChild(child);
                                }
                            });
                        } else {
                            //    console.error('Loading async HTML failed');
                        }
                    });
                }
            },
            pushLoadCBs = [],
            modViews = {
                ready: function () {
                    console.log('async is ready');
                    var obj, cbCount = filesToLoad.length;
                    while (filesToLoad.length > 0) {
                        obj = filesToLoad.splice(0, 1)[0];
                        fc.loadHTML(obj.node, obj.attr, function () {
                            cbCount--;
                            if (cbCount <= 0) {
                                console.log('async parsing done');
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
                loadHTML : fc.loadHTML,
                /**
                 * Deprecated: use loadHTML instead
                 * @param path
                 * @param cb
                 */
                load: function (path, cb) {
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
    if (typeof module !== 'undefined') {
        module.exports = async;
    } else {
        canny.add('async', async);
    }

}());
