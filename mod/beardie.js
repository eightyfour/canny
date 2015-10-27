/*global canny */
/*jslint browser: true*/

/**
 *
 * beardie is a working name for the new whisker. So far I can keep the backward functionality I will rename,
 * beardie to whisker.
 *
 * E.g. {{beardie}}:
 *  <div canny-mod="beardie" canny-var="{'message':'dynamic text'}">
 *     <p>DATA: {{message}})</p>
 *  </div>
 *
 *  TODO:
 *  Remove whiskerUpdate
 *   and just provide a function pointer for whisker - whisker will call the pointer with a
 *   update function pointer so that the external function has the control about the rendered data.
 *
 *   If there is not function pointer so do the same as before or just render the data (first will keep the backward compatibility).
 *
 *  Add attribute replace support
 *   so toggle classes will be so much easier ;-)
 *
 *  Global key usage
 *   So I can also use a global key inside my custom whisker
 *
 *  This is a major change and it should be implemented in a new module with the additional functionality:
 *  * update tag attribute properties
 */
(function () {
    "use strict";

    var openChar = '{',
        endChar  = '}',
        ESCAPE_RE = /[-.*+?^${}()|[\]\/\\]/g,
        beardie = (function () {
            var BINDING_RE = getRegex(),
                whiskerUpdateMap = {};
            /**
             *  Parse a piece of text, return an array of tokens
             *  @param text
             *  @return [key:String, html:boolean]
             */
            function parse(text) {
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
            }
            /**
             *
             * @param node
             * @param dataObj
             * @param attr
             */
            function compileTextNode(node, dataObj, attr) {
                var tokens = parse(node.nodeValue), obj = dataObj, el, token, i, l;

                if (!tokens || obj === undefined || typeof obj === 'string') {return; }

                for (i = 0, l = tokens.length; i < l; i++) {
                    token = tokens[i];

                    if (token.key && obj.hasOwnProperty(token.key)) { // a binding
                        el = document.createTextNode(obj[token.key]);
                        if (whiskerUpdateMap.hasOwnProperty(attr)) {
                            if (whiskerUpdateMap[attr].keyMap === undefined) {
                                whiskerUpdateMap[attr].keyMap = {};
                            }
                            if (!whiskerUpdateMap[attr].keyMap[token.key]) {
                                whiskerUpdateMap[attr].keyMap[token.key] = [];
                            }
                            whiskerUpdateMap[attr].keyMap[token.key].push(el);
                        }
                        node.parentNode.insertBefore(el, node);
                    } else { // a plain string
                        el = document.createTextNode(token);
                        node.parentNode.insertBefore(el, node);
                    }
                    // insert node

                }
                node.parentNode.removeChild(node);
            }
            /**
             *
             * @param node
             * @param dataObj
             * @param attr
             */
            function compileElement(node, dataObj, attr) {
                // recursively compile childNodes
                if (node.hasChildNodes()) {
                    [].slice.call(node.childNodes).forEach(function (child) {
                        compile(child, dataObj, attr);
                    });
                }
            }
            /**
             *  Compile a DOM node (recursive)
             */
            function compile(node, dataObj, attr) {
                var nodeType = node.nodeType;
                if (nodeType === 1 && node.tagName !== 'SCRIPT') { // a normal node
                    compileElement(node, dataObj, attr);
                } else if (nodeType === 3) {
                    compileTextNode(node, dataObj, attr);
                }
            }
            /**
             *
             * @param node
             * @param attr
             */
            function initialize(node, attr) {
                var dataObj = getGlobalCall(attr, window), obj;
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
                                        node.nodeValue = data[whiskerName];
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

    /**
     * Read a property from a given string and object.
     * Returns the founded property pointer or undefined.
     * @param value
     * @param obj
     * @returns {*} or undefined
     */
    function getGlobalCall (value, obj) {
        var split = value.split('.'),
            rec = function (cur) {
                if (obj[cur] !== undefined) {
                    obj = obj[cur];
                    rec(split.shift());
                } else if (cur === value ) {
                    obj = undefined;
                }
            };
        rec(split.shift());
        return obj;
    }

    // export as module or bind to global
    if (typeof module !== 'undefined') {
        module.exports = beardie;
    } else {
        canny.add('beardie', beardie);
    }

}());
