/*global canny */
/*jslint browser: true*/

/**
 * E.g. {{whisker}}:
 *  <div canny-mod="whisker" canny-var="{'message':'dynamic text'}">
 *     <p>DATA: {{message}})</p>
 *  </div>
 *
 *  If the object implements a function named 'whiskerUpdate' whisker will push a callback to it.
 *  This callback can be called with the data object to update the data there bind to the whiskers.
 *
 */
(function () {
    "use strict";

    var openChar = '{',
        endChar  = '}',
        ESCAPE_RE = /[-.*+?^${}()|[\]\/\\]/g,
        whisker = (function () {
            var BINDING_RE = getRegex(),
                whiskerUpdateMap = {},
                /**
                 *  Parse a piece of text, return an array of tokens
                 */
                parse = function (text) {
                    if (!BINDING_RE.test(text)) {return null; }
                    var m, i, token, match, tokens = [];
                    /* jshint boss: true */
                    while (m = text.match(BINDING_RE)) {
                        i = m.index;
                        if (i > 0) {tokens.push(text.slice(0, i)); }
                        token = { key: m[1].trim() };
                        match = m[0];
                        token.html =
                                match.charAt(2) === openChar &&
                                match.charAt(match.length - 3) === endChar;
                        tokens.push(token);
                        text = text.slice(i + m[0].length);
                    }
                    if (text.length) {tokens.push(text); }
                    return tokens;
                },
                /**
                 *
                 * @param node
                 * @param dataObj
                 * @param attr
                 */
                compileTextNode  = function (node, dataObj, attr) {
                    var tokens = parse(node.nodeValue), obj = dataObj, el, token, i, l, span;

                    if (!tokens || obj === undefined || typeof obj === 'string') {return; }

                    for (i = 0, l = tokens.length; i < l; i++) {
                        token = tokens[i];

                        if (token.key && obj.hasOwnProperty(token.key)) { // a binding
                            span = document.createElement('span');
                            el = document.createTextNode(obj[token.key]);
                            span.appendChild(el);
                            if (whiskerUpdateMap.hasOwnProperty(attr)) {
                                if (whiskerUpdateMap[attr].keyMap === undefined) {
                                    whiskerUpdateMap[attr].keyMap = {};
                                }
                                if (!whiskerUpdateMap[attr].keyMap[token.key]) {
                                    whiskerUpdateMap[attr].keyMap[token.key] = [];
                                }
                                whiskerUpdateMap[attr].keyMap[token.key].push(span);
                            }
                            node.parentNode.insertBefore(span, node);
                        } else { // a plain string
                            console.log('whisker obj: ', obj);
                            el = document.createTextNode(token);
                            node.parentNode.insertBefore(el, node);
                        }
                        // insert node

                    }
                    node.parentNode.removeChild(node);
                },
                compileElement = function (node, dataObj, attr) {
                    // recursively compile childNodes
                    if (node.hasChildNodes()) {
                        [].slice.call(node.childNodes).forEach(function (child) {
                            compile(child, dataObj, attr);
                        });
                    }
                },
                /**
                 *  Compile a DOM node (recursive)
                 */
                compile = function (node, dataObj, attr) {
                    var nodeType = node.nodeType;
                    if (nodeType === 1 && node.tagName !== 'SCRIPT') { // a normal node
                        compileElement(node, dataObj, attr);
                    } else if (nodeType === 3) {
                        compileTextNode(node, dataObj, attr);
                    }
                },
                getGlobalCall = function (value) {
                    var split = value.split('.'),
                        end = window,
                        rec = function (cur) {
                            if (end[cur]) {
                                end = end[cur];
                                rec(split.shift());
                            }
                        };
                    rec(split.shift());
                    return end;
                };

            function initialize(node, attr) {
                var dataObj = getGlobalCall(attr), obj;
                if (typeof dataObj === 'function') {
                    obj = dataObj();
                } else {
                    obj = dataObj;
                }
                if (obj.hasOwnProperty('whiskerUpdate')) {
                    if (!whiskerUpdateMap[attr]) {
                        whiskerUpdateMap[attr] = {
                            obj : obj,
                            keyMap : undefined
                        };
                    }
                    whiskerUpdateMap[attr].obj.whiskerUpdate(function (data) {
                        if (!whiskerUpdateMap[attr].keyMap) {
                            initialize(node, attr);
                        }

                        if (whiskerUpdateMap[attr].keyMap) {
                            Object.keys(whiskerUpdateMap[attr].keyMap).forEach(function (whiskerName) {
                                if (data[whiskerName]) {
                                    whiskerUpdateMap[attr].keyMap[whiskerName].forEach(function (node) {
                                        node.innerHTML = data[whiskerName];
                                    });
                                }
                            });
                        }
                    });
                }
                compile(node, obj, attr);
            }

            return {
                getTextNodes : function () {
                    return whiskerUpdateMap;
                },
                add : function (node, attr) {
                    if (typeof attr === 'string') {
                        initialize(node, attr);
                    }
                }
            };
        }());

    function escapeRegex(str) {
        return str.replace(ESCAPE_RE, '\\$&');
    }

    function getRegex() {
        var open = escapeRegex(openChar),
            end  = escapeRegex(endChar);
        return new RegExp(open + open + open + '?(.+?)' + end + '?' + end + end);
    }

    // export as module or bind to global
    if (typeof module !== 'undefined') {
        module.exports = whisker;
    } else {
        canny.add('whisker', whisker);
    }

}());
