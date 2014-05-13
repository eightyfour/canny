/*global canny */
/*jslint browser: true*/

/**
 * TODO DESCRIPTION
 *
 */
(function () {
    "use strict";

    var openChar = '{',
        endChar  = '}',
        ESCAPE_RE = /[-.*+?^${}()|[\]\/\\]/g,
        whisker = (function () {
            var BINDING_RE = getRegex(),
                /**
                 *  Parse a piece of text, return an array of tokens
                 */
                parse = function (text) {
                    if (!BINDING_RE.test(text)) {return null; }
                    var m, i, token, match, tokens = []
                    /* jshint boss: true */
                    while (m = text.match(BINDING_RE)) {
                        i = m.index;
                        if (i > 0) {tokens.push(text.slice(0, i)); }
                        token = { key: m[1].trim() }
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
                 */
                compileTextNode  = function (node, dataObj) {
                    var tokens = parse(node.nodeValue), obj = dataObj, el, token, i, l;

                    if (typeof dataObj === 'function') {
                        obj = dataObj();
                    }
                    if (!tokens || obj === undefined) {return; }

                    for (i = 0, l = tokens.length; i < l; i++) {
                        token = tokens[i];

                        if (token.key && obj.hasOwnProperty(token.key)) { // a binding
                            el = document.createTextNode(obj[token.key]);
                        } else { // a plain string
                            el = document.createTextNode(token);
                        }
                        // insert node
                        node.parentNode.insertBefore(el, node);
                    }
                    node.parentNode.removeChild(node);
                },
                compileElement = function (node, dataObj) {
                    // recursively compile childNodes
                    if (node.hasChildNodes()) {
                        [].slice.call(node.childNodes).forEach(function (child) {
                            compile(child, dataObj);
                        });
                    }
                },
                /**
                 *  Compile a DOM node (recursive)
                 */
                compile = function (node, dataObj) {
                    var nodeType = node.nodeType
                    console.log('NODE TYPE', nodeType, node);
                    if (nodeType === 1 && node.tagName !== 'SCRIPT') { // a normal node
                        compileElement(node, dataObj);
                    } else if (nodeType === 3) {
                        compileTextNode(node, dataObj);
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

            return {
                data: {
                    name : 'Enis',
                    moduleName : 'knoppi'
                },
                add : function (node, attr) {
                    var obj = attr;
                    if (typeof attr === 'string') {
                        obj = getGlobalCall(attr);
                    }
                    compile(node, obj);
                },
                ready : function () {
                    console.log('module parse ready');
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
