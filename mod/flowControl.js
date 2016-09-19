/*global canny */
/*jslint browser: true*/

/**
 * E.g.: canny-mod="flowControl" canny-var="{'view' : 'viewName'}"
 *
 * you can activate a initial view with a anchor in the URL e.g.: yourdomain.html#viewToShow
 * Or pass a comma separated module list for activate more module #viewToShow,otherView
 *
 * TODO made it possible to summarize views with one identifier.
 * Instead of call: canny.flowControl.show('view1', 'view2', 'view3') call canny.flowControl.show('view').
 *
 * TODO add a hide method that just hide the specific element.
 *
 * TODO handle the fade in and out via CSS classes - and use transitions for it
 */
(function () {
    "use strict";

    /**
     * wraps transitionend event vendor implementation
     */
    function onTransitionEndOnce(node, cb) {
        var event = (function () {
                if (node.style.webkitTransition !== undefined) {
                    return 'webkitTransitionEnd';
                } else if (node.style.transition !== undefined) {
                    return 'transitionend';
                }
            }()),
            listener = function(e) {
                e.target.removeEventListener(e.type, listener);
                cb(e);
            };
        if (event) {
            node.addEventListener(event, listener, false);
        } else {
            cb();
        }
    }

    var flowControlInstance = function (fcInstanceName) {
        var instanceName = fcInstanceName,
            // modViews is a dictionary storing instances of flowControlModule, e.g.
            // <div canny-mod="flowControl" canny-var="{'view': 'view1'}">Content1</div>
            // <div canny-mod="flowControl" canny-var="{'view': 'view1'}">Content2</div>
            // stores both flowControl-instances into modViews['view1']
            modViews = {}, // saves module views
            getViewAnchor = function () {
                var hash = location.hash || null, hashSub, params, result;
                if (hash) {
                    hashSub = hash.substr(1);
                    params = hashSub.split('|');
                    hashSub = params.shift().split(',');
                    result = {
                        views : hashSub
                    };

                    if (params.length > 0) {
                        result.params = {};
                        params = params.toString().split(',');
                        params.forEach(function(keyAndValue, index) {
                            var keyValue = keyAndValue.split('=');
                            if (keyValue[1]) {
                                result.params[keyValue[0]] = keyValue[1];
                            } else {
                                result.params[index] = keyValue[0];
                            }
                        });
                    }
                }
                return result;
            },
            getAllModuleChildrens = function (cNode) {
                // TODO test selector if we have more than one module in canny-mod
                var children = cNode.querySelectorAll('[canny-mod*=' + instanceName + ']'),
                    fc_childNodes = {};
//                            if (cNode.hasChildNodes()) {
//                                [].slice.call(cNode.children).forEach(findChildren);
//                            }
                [].slice.call(children).forEach(function (mod) {
                    var attrValue, view;
                    // TODO read attributes should be a part of canny functionality
                    attrValue = mod.getAttribute('canny-var').split("\'").join('\"');
                    if (/:/.test(attrValue)) {
                        // could be a JSON
                        view = JSON.parse(attrValue).view;
                    } else {
                        view = attrValue;
                    }
                    fc_childNodes[view] = mod;
                });
                return fc_childNodes;
            },
            /**
             * Each flowControl node will end up in a flowControlModule.
             *
             * @param node
             * @param attr
             * @returns {{hasChildrenWithName: hasChildrenWithName, getViewName: getViewName, show: show, hide: hide, fadeOut: fadeOut, getNode: getNode, fadeIn: fadeIn}}
             */
            flowControlModule = function (node, attr) {
                var flowControlChildNodes = {},
                    async = false,
                    parentViews = fc.getParentNode(attr.view);
                // saves all children in a object
                flowControlChildNodes = getAllModuleChildrens(node);
//                    console.log('flowControlChildNodes:', flowControlChildNodes);
                return {
                    hasChildrenWithName : function (viewName) {
                        return flowControlChildNodes.hasOwnProperty(viewName);
                    },
                    getViewName : function () {
                        return attr.view;
                    },
                    display : function () {
                        // don't call parents
                        // don't fade in
                        node.style.display = '';
                    },
                    show : function (cb) {
                        if (parentViews) {
                            parentViews.forEach(function (fc_module) {
//                                console.log('parentViews', fc_module.getViewName());
                                fc_module.display();
                            });
                        }
                        if (!async && attr.hasOwnProperty('async')) {
                            canny.async.loadHTML(node, {url : attr.async}, function () {
                                if (attr.whisker) {
                                    if (canny.whisker !== undefined) {
                                        canny.whisker.add(node, attr.whisker);
                                    } else {
                                        console.error("flowControl:try execute whisker but no whisker module is registered on canny.")
                                    }
                                }
                                node.style.display = '';
                                cb();
                            });
                            async = true;
                        } else {
                            node.style.display = '';
                            cb && cb();
                        }
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
                        if (parentViews) {
                            parentViews.forEach(function (fc_module) {
//                                console.log('parentViews', fc_module.getViewName());
                                fc_module.display();
                            });
                        }
                        if (!async && attr.hasOwnProperty('async')) {
                            canny.async.loadHTML(node, {url : attr.async}, function () {
                                if (attr.whisker) {
                                    if (canny.whisker !== undefined) {
                                        canny.whisker.add(node, attr.whisker);
                                    } else {
                                        console.error("flowControl:try execute whisker but no whisker module is registered on canny.");
                                    }
                                }
                                fc.fadeIn(node,  cb || function () {});
                            });
                            async = true;
                        } else {
                            fc.fadeIn(node,  cb || function () {});
                        }
                    }
                };

            },
            showInitialView = getViewAnchor(),
            fc = {
                // get all parent modules from the given viewName
                getParentNode : function (viewName) {
                    var queue = Object.keys(modViews), l, i, parents = [];
                    l = queue.length;
                    for (i = 0; i < l; i++) {
                        // TODO
                        if (viewName !== queue[i] && modViews[queue[i]][0].hasChildrenWithName(viewName)) {
                            parents.push(modViews[queue[i]][0]);
                        }
                    }
                    return parents.length === 0 ? null : parents;
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
                            // TODO call ends always with null - viewName is top parent
                            var pViewName = fc.getParentNode(viewName);
//                            console.log('viewName: ' + viewName, 'pViewName ' + pViewName );
                            if (pViewName) {
                                pViewName.forEach(function (fc_module) {
                                    // TODO while has parent add it to the extViews
                                    pushExtViews(fc_module.getViewName());
                                    addParentView(fc_module.getViewName());
                                });
                            }
                        };
                    l = views.length;
                    for (i = 0; i < l; i++) {
                        pNode = fc.getParentNode(views[i]);
                        if (pNode) {
                            pNode.forEach(function (fc_module) {
                                pushExtViews(fc_module.getViewName());
                                // so far we have parents do it recursive
                                // TODO not needed each parent will do it by own -
                                addParentView(fc_module.getViewName());
                            });
                        }
                    }
                    return extViews;
                },
                fadeOut : function (node, cb) {

                    if(node.style.display === 'none') {
                        cb();
                    } else {
                        node.classList.add('c-flowControl');
                        node.classList.add('fade-out');

                        setTimeout(function () {
                            node.style.display = 'none';
                            node.classList.remove('c-flowControl');
                            node.classList.remove('fade-out');
                            cb();
                        }, 300);
                    }

                },
                fadeIn : function (node, cb) {
                    // TODO: fade in does not work properly
                    node.style.display = '';
                    node.classList.add('c-flowControl');
                    node.classList.add('fade-in');

                    setTimeout(function() {
                        node.classList.remove('c-flowControl');
                        node.classList.remove('fade-in');
                        cb();

                        // trigger reflow to fix the black boxes issue FTTWO-1249
                        // TODO: check if this can be avoided or
                        var box = document.querySelector('.t-centerBox-content');
                        if (box) {
                            box.style.opacity = 0.99;
                            setTimeout(function() {
                                box.style.opacity = 1;
                            }, 50);
                        }
                    }, 300);
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
            },
            /**
             *
             * @type {{mod: {}, createNewInstance: createNewInstance, ready: ready, add: add, show: show, fadeIn: fadeIn, showImmediately: showImmediately, overlay: overlay}}
             */
            api = {
                mod : modViews, // part of api
                /**
                 * this method could be used to create new instances of flowControl (only needed if you
                 * load this script directly without require)
                 * @param name (unique module name)
                 **/
                createNewInstance : function (name) {
                    return flowControl(name);
                },
                ready : function () {
                    var modNames, i, l;
                    if (showInitialView) {
                        modNames = Object.keys(modViews);
                        l = modNames.length;
                        // check if showInitialView contains a registered module
                        for (i = 0; i < l; i++) {
                            if (showInitialView.views.indexOf(modNames[i]) !== -1) {
                                if (showInitialView.params) {
                                    showInitialView.views.push(function transmitParameters() {
                                        postMessage && postMessage({
                                            type: 'message_request',
                                            view: modNames[i],
                                            params: showInitialView.params
                                        },
                                        location.protocol + '//' + location.host);
                                    });
                                }
                                api.showImmediately.apply(null, showInitialView.views);
                                break;
                            }
                        }
                    }
                },
                /**
                 *
                 * @param node
                 * @param attr {{view:(identifier),}}
                 */
                add : function (node, attr) {    // part of api
                    if (!modViews[attr.view]) {
                        modViews[attr.view] = [];
                    }
                    modViews[attr.view].push(flowControlModule(node, attr));
                },
                /**
                 * @deprecated will handle showImmediately in near future
                 */
                show : function () {
                    api.fadeIn.apply(this, arguments);
                },
                /**
                 * @param name (arguments list of views to show)
                 */
                fadeIn : function (name) {
                    var showMods = [].slice.call(arguments),
                        queue = Object.keys(modViews),
                        queueCount = 0,// = queue.length,
                        fadeIn = function () {
                            showMods.forEach(function (module) {
                                if (modViews.hasOwnProperty(module)) {
                                    modViews[module].forEach(function (obj) {
                                        obj.fadeIn(function () {
                                            // TODO remove
//                                                console.log('FADE IN DONE');
                                            // TODO count callbacks and handle it ?
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
                    queue.forEach(function (view) {
                        queueCount += modViews[view].length;
                    });
                    // iterate over all registered modules
                    queue.forEach(function (view) {
                        // iterate over all instances of the same view
                        modViews[view].forEach(function (obj) {
                            // hide all (except incoming and parents) TODO but only the parents of the module
                            if (showMods.indexOf(view) === -1) {
                                obj.fadeOut(function () {
                                    queueCount--;
                                    if (queueCount <= 0) {
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
                /**
                 * @deprecated use show instead
                 * @param name
                 */
                showImmediately : function () {    // module specific
                    var showMods = [].slice.call(arguments),
                        queue = Object.keys(modViews),
                        countCb = (function () {
                            var cb, length = 0;
                            // if last param is function than handle it as callback
                            if (typeof showMods[showMods.length - 1] === 'function') {
                                cb = showMods[showMods.length - 1];
                            }
                            return {
                                countUp : function (num) {
                                    length += num;
                                },
                                reduce : function () {
                                    length--;
                                    if (cb && length <= 0) {
                                        cb();
                                    }
                                }
                            };
                        }()),
                        show = function () {
                            showMods.forEach(function (module) {
                                if (modViews.hasOwnProperty(module)) {
                                    countCb.countUp(modViews[module].length);
                                    modViews[module].forEach(function (obj) {
                                        obj.show(countCb.reduce);
                                    });
                                }
                            });
                        };
                    showMods = fc.addParents(showMods);
                    // hide all (except incoming)
                    queue.forEach(function (view) {
                        modViews[view].forEach(function (obj) {
                            if (showMods.indexOf(obj) === -1) {
                                obj.hide();
                            }
                        });
                    });
                    show();
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
        return api;
    },
    flowControl = (function () {
        var instances = {};
        return function (name) {
            var instance,
                def = name || 'flowControl';
            if (instances.hasOwnProperty(def)) {
                instance = instances[def];
            } else {
                instances[def] = flowControlInstance(def);
                instance = instances[def];
            }
            return instance;
        };
    }());
    // export as module or bind to global
    if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) { module.exports = flowControl; } else {canny.add('flowControl', flowControl('flowControl')); }

}());
