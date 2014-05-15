/*global canny */
/*jslint browser: true*/

/**
 * E.g.: canny-mod="flowControl" canny-var="{'view' : 'viewName'}"
 *
 * you can activate a initial view with a anchor in the URL e.g.: yourdomain.html#viewToShow
 * Or pass a comma separated module list for activate more module #viewToShow,otherView
 *
 * TODO made it possible to summarize views with one identifier.
 * Instead of call: gdom.flowControl.show('view1', 'view2', 'view3') call gdom.flowControl.show('view').
 *
 * TODO add a hide method that just hide the specific element.
 */
(function () {
    "use strict";

    var flowControlInstance = function () {

        var modViews = {}, // saves module views
            getViewAnchor = function () {
                var hash = location.hash || null, hashSub;
                if (hash) {
                    hashSub = hash.substr(1);
                    return hashSub.split(',');
                }
                return hash;
            },
            showInitialView = getViewAnchor(),
            fc = {
                // get the parent module from the given viewName
                getParentNode : function (viewName) {
                    var queue = Object.keys(modViews), l, i;
                    l = queue.length;
                    for (i = 0; i < l; i++) {
                        // TODO for the first only the first element
                        if (viewName !== queue[i] && modViews[queue[i]][0].hasChildrenWithName(viewName)) {
                            return modViews[queue[i]][0];
                        }
                    }
                    return null;
                },
                // passes a view list and complete the list with all parent node names
                addParents : function (views) {
                    var extViews = views, i, l, pNode,
                        pushExtViews = function (name) {
                            if (extViews.indexOf(name) === -1) {
                                extViews.push(name);
                            }
                        },
                        addParentView = function (viewName) {
                            var pViewName = fc.getParentNode(viewName);
                            if (pViewName) {
                                // TOOD while has parent add it to the extViews
                                pushExtViews(pViewName.getViewName());
                                addParentView(pViewName.getViewName());
                            }
                        };
                    l = views.length;
                    for (i = 0; i < l; i++) {
                        pNode = fc.getParentNode(views[i]);
                        if (pNode) {
                            pushExtViews(pNode.getViewName());
                            // so far we have parents do it recursive
                            addParentView(pNode.getViewName());
                        }
                    }
                    return extViews;
                },
                fadeOut : function (node, cb) {
                    var opacity = node.style.opacity || 1,
                        fade = function (op) {
                            if (op > 0) {
                                node.style.opacity = op;

                                setTimeout(function () {
                                    fade(op - 0.1);
                                }, 30);
                            } else {
                                node.style.display = 'none';
                                cb();
                            }
                        };
                    fade(opacity);
//                    console.log('fadeOut', node);
                },
                fadeIn : function (node, cb) {
                    var opacity = node.opacity || 0,
                        fade = function (op) {
                            if (op <= 1) {
                                node.style.opacity = op;
                                setTimeout(function () {
                                    fade(op + 0.1);
                                }, 30);
                            } else {
                                cb();
                            }
                        };
                    if (node.style.display === 'none') {
                        node.style.opacity = opacity;
                        node.style.display = '';
                        fade(opacity);
                    } else {
                        node.style.opacity = 1;
//                        console.log('fadeIn', node);
                    }
                }
            },
            ext = {
                /**
                 *
                 * @param node
                 * @param innerNode
                 * @returns {{remove: remove}}
                 */
                progress : function (node, innerNode) {
                    var newNode = document.createElement('div'), centerNode = document.createElement('div'), txtNode;
                    node.style.position = 'relative';
                    newNode.style.opacity = '0.6';
                    newNode.style.backgroundColor = '#666';
                    newNode.style.position = 'absolute';
                    newNode.style.top = 0;
                    newNode.style.left = 0;
                    newNode.style.width = node.offsetWidth + 'px';
                    newNode.style.height = node.offsetHeight + 'px';
                    newNode.style.borderRadius = window.getComputedStyle(node, null).borderRadius;

                    centerNode.style.position = 'absolute';
                    centerNode.style.top = (node.offsetHeight / 2) - 30 + 'px';
                    centerNode.style.width = node.offsetWidth + 'px';
                    centerNode.style.textAlign = 'center';

                    if (innerNode) {
                        centerNode.appendChild(innerNode);
                    }
                    node.appendChild(newNode);
                    node.appendChild(centerNode);
                    return {
                        remove : function (delay, cb) {
                            setTimeout(function () {
                                node.removeChild(newNode);
                                node.removeChild(centerNode);
                                cb && cb();
                            }, delay || 0);
                        },
                        fadeOut : function (delay, cb) {
                            setTimeout(function () {
                                fc.fadeOut(newNode, function () {
                                    node.removeChild(newNode);
                                    node.removeChild(centerNode);
                                    cb && cb();
                                });
                            }, delay || 0);
                        }
                    };
                }
            };

        return {
            mod : modViews, // part of api
            ready : function () {
                var modNames, i, l;
                if (showInitialView) {
                    modNames = Object.keys(this.mod);
                    l = modNames.length;
                    // check if showInitialView contains a registered module
                    for (i = 0; i < l; i++) {
                        if (showInitialView.indexOf(modNames[i]) !== -1) {
                            this.showImmediately.apply(null, showInitialView);
                            break;
                        }
                    }
                }
            },
            add : function (node, attr) {    // part of api
                if (!modViews[attr.view]) {
                    modViews[attr.view] = [];
                }
                modViews[attr.view].push((function (node, parentView) {
                    var flowControlChildNodes = {},
                    // TODO do it with a querySelectorAll
                        findChildren = function (cNode) {
                            if (cNode.hasChildNodes()) {
                                [].slice.call(cNode.children).forEach(findChildren);
                            }
                            var modAttr = cNode.getAttribute('gd-module'), attrValue, view;
                            if (/flowControl/.test(modAttr)) {
//                                console.log(cNode);
                                // TODO read attributes should be part gdom functionality
                                attrValue = cNode.getAttribute('gd-attr').split("\'").join('\"');
                                if (/:/.test(attrValue)) {
                                    // could be a JSON
                                    view = JSON.parse(attrValue).view;
                                } else {
                                    view = attrValue;
                                }
                                flowControlChildNodes[view] = cNode;
                            }
                        };
                    // saves all children in a object
                    [].slice.call(node.children).forEach(findChildren);

                    return {
                        hasChildrenWithName : function (viewName) {
                            return flowControlChildNodes.hasOwnProperty(viewName);
                        },
                        getViewName : function () {
                            return attr.view;
                        },
                        show : function () {
                            parentView && parentView.show();
                            node.style.display = '';
                        },
                        hide : function () {
                            node.style.display = 'none';
                        },
                        fadeOut : function (cb) {
                            fc.fadeOut(node, cb || function () {});
                        },
                        getNode : function () {
                            return node;
                        },
                        fadeIn : function (cb) {
                            parentView && parentView.show();  // do show fadeIn has flickering
                            fc.fadeIn(node,  cb || function () {});
                        }
                    };

                }(node, fc.getParentNode(attr.view))));
            },
            // TODO rename it to fadeIn
            show : function (name) {    // module specific
                var showMods = [].slice.call(arguments),
                    queue = Object.keys(modViews),
                    queueCount = 0,// = queue.length,
                    fadeIn = function () {
                        showMods.forEach(function (module) {
                            if (modViews.hasOwnProperty(module)) {
                                modViews[module].forEach(function (obj) {
                                    obj.fadeIn(function () {
                                        // TODO remove
//                                        console.log('FADE IN DONE');
                                    });
                                });
                            }
                        });
                        // if last param is function than handle it as callback
                        if (typeof showMods[showMods.length - 1] === 'function') {
                            showMods[showMods.length - 1]();
                        }
                    };

                showMods = fc.addParents(showMods);
                // hide all (except incoming)

                queue.forEach(function (view) {
                    queueCount += modViews[view].length;
                    modViews[view].forEach(function (obj) {
                        if (showMods.indexOf(obj) === -1) {
                            obj.fadeOut(function () {
                                queueCount--;
                                if (queueCount <= 0) {
                                    // FADE IN
                                    fadeIn();
                                }
                            });
                        } else {
                            queueCount--;
                            if (queueCount <= 0) {
                                fadeIn();
                            }
                        }
                    });
                });
            },
            // rename it to show
            showImmediately : function (name) {    // module specific
                var showMods = [].slice.call(arguments),
                    queue = Object.keys(modViews),
                    queueCount = 0,
                    show = function () {
                        showMods.forEach(function (module) {
                            if (modViews.hasOwnProperty(module)) {
                                modViews[module].forEach(function (obj) {
                                    obj.show();
                                });
                            }
                        });
                    };
                showMods = fc.addParents(showMods);
                // hide all (except incoming)
                queue.forEach(function (view) {
                    queueCount += modViews[view].length;
                    modViews[view].forEach(function (obj) {
                    queueCount--;
                        if (showMods.indexOf(obj) === -1) {
                            obj.hide();
                        }
                        if (queueCount <= 0) {
                            show();
                        }
                    });
                });
            },
            overlay : function (name) {
                var node;
                // it's own module?
                if (modViews.hasOwnProperty(name)) {
                    node = modViews[name].getNode();
                } else {
                    node = document.getElementById(name);
                }

                return {
                    by : function (name, text) {
                        return ext[name](node, text);
                    }
                };
            }
        };
    },
    flowControl  = (function () {
        var instances = {};
        return function (name) {
            var instance,
                    def = name || 'flowControl';
            if (instances.hasOwnProperty(def)) {
                instance = instances[def];
            } else {
                instances[def] = flowControlInstance();
                instance = instances[def];
            }
            return instance;
        };
    }());
    // export as module or bind to global
    if (typeof module !== 'undefined') { module.exports = flowControl; } else {canny.add('flowControl', flowControl('flowControl')); }

}());
