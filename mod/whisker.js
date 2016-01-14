/*global canny */
/*jslint browser: true*/
/**
 *
 * E.g. {{whisker}}:
 *  <div canny-mod="whisker" canny-var="{'bind':'scope','to':{'message':'My text'}}">
 *     <p>DATA: {{scope.message}})</p>
 *  </div>
 *  Or just pass the function pointer the default scope is 'scope'.
 *  <div canny-mod="whisker" canny-var="mymodule.functionPointer">
 *     <p>DATA: {{scope.message}})</p>
 *  </div>
 *
 */
(function () {
    "use strict";

    var openChar = '{',
        endChar  = '}',
        ESCAPE_RE = /[-.*+?^${}()|[\]\/\\]/g,
        whisker = (function () {
            var BINDING_RE = getRegex();
            /**
             *  Parse a piece of text, return an array of tokens
             *  TODO refactor method
             *  @param text
             *  @return [{key:String, html:boolean}]
             */
            function parse(text) {
                if (!BINDING_RE.test(text)) {return null; }
                var m, i, token, match, tokens = [], orig = {text: text, idx : 0}, textObject;
                /* jshint boss: true */
                while (m = text.match(BINDING_RE)) {
                    i = m.index;
                    token = {concat : true};
                    if (i > 0) {
                        if (orig.idx === 0) {
                            textObject = {
                                concat : orig.text[orig.idx - 1] !== ' ',
                                value : text.slice(0, i),
                                text : true
                            };
                            orig.idx += i;
                        } else {
                            orig.idx += i;
                            textObject = {
                                concat : orig.text[orig.idx - 1] !== ' ',
                                value : text.slice(0, i),
                                text : true
                            };
                        }
                        tokens.push(textObject);
                    }
                    orig.idx += i;
                    token.key = m[1].trim();
                    match = m[0];
                    token.html =
                        match.charAt(2) === openChar &&
                        match.charAt(match.length - 3) === endChar;
                    tokens.push(token);
                    text = text.slice(i + m[0].length);
                }
                if (text.length) {
                    tokens.push({value : text, text : true, concat: true});
                }
                return tokens;
            }
            /**
             *
             * @param node
             * @param dataObj
             * @param itemName
             * @return tokens [{key:String, node:DOM node, html: boolean}]
             */
            function compileTextNode(node, dataObj, itemName) {
                var tokens = parse(node.nodeValue),
                    obj = dataObj,
                    el, token, i, l, tmp, tokenObjectProperty, val;
                if (!tokens || obj === undefined || typeof obj === 'string') {return; }

                for (i = 0, l = tokens.length; i < l; i++) {
                    token = tokens[i];

                    if (typeof token === 'object' && token.hasOwnProperty('key')) {
                        tmp = token.key.split('.');
                        if (tmp.length > 0 && tmp[0] === itemName) {
                            tokenObjectProperty = tmp.slice(1).join('.');
                            if (typeof obj === 'object') {
                                val = getGlobalCall(tokenObjectProperty, obj);
                            } else {
                                val = obj;
                            }
                        } else {
                            // just a string?
                            val = obj;
                        }
                        if (typeof val === 'string' || typeof val === 'number') {
                            el = document.createTextNode(val);
                            node.parentNode.insertBefore(el, node);
                        } else if (typeof val === 'boolean') {
                            el = document.createTextNode(val.toString());
                            node.parentNode.insertBefore(el, node);
                        } else if (typeof val === 'function') {
                            el = document.createTextNode(val(node.parentNode));
                            node.parentNode.insertBefore(el, node);
                        } else if (tmp[0] === itemName) {
                            // property is not exists but it is the same scope
                            el = document.createTextNode('');
                            node.parentNode.insertBefore(el, node);
                        } else {
                            // restore the token... looks like is not mine
                            el = document.createTextNode('{{' + token.key + '}}');
                            node.parentNode.insertBefore(el, node);
                        }
                        token.node = el;
                    } else {
                        el = document.createTextNode(token.value);
                        // just normal string put back to view
                        node.parentNode.insertBefore(el, node);
                    }
                }
                node.parentNode.removeChild(node);
                return tokens;
            }
            /**
             *
             * @param node
             * @param dataObj
             * @param itemName
             */
            function compileElement (node, dataObj, itemName) {
                var tokens = [],
                    token;
                // recursively compile childNodes
                if (node.hasChildNodes()) {
                    [].slice.call(node.childNodes).forEach(function (child) {
                        token = compile(child, dataObj, itemName);
                        if (token) {
                            tokens = tokens.concat(token);
                        }
                    });
                }
                return tokens.length > 0 ? tokens : undefined;
            }
            /**
             *  Compile a DOM node (recursive)
             * @param node
             * @param dataObj
             * @param itemName
             * @returns {*}
             */
            function compile(node, dataObj, itemName) {
                var nodeType = node.nodeType,
                    tokens = [],
                    token;
                if (nodeType === 1 && node.tagName !== 'SCRIPT') { // a normal node
                    token = compileElement(node, dataObj, itemName);
                    if (token) {
                        tokens = tokens.concat(token);
                    }
                } else if (nodeType === 3) {
                    token = compileTextNode(node, dataObj, itemName);
                    if (token) {
                        tokens = tokens.concat(token);
                    }
                }
                return tokens.length > 0 ? tokens : undefined;
            }

            /**
             * Replaces expressions for all tag attributes
             *
             * loop though all children and check if a attribute has a expressions inside
             *
             * @param containerNode
             * @param obj
             * @param itemName
             * @return returnTokens [{key:String, attr: node attribute reference, html: boolean}]
             */
            function handleAttributes(containerNode, obj, itemName) {
                var returnTokens = [];
                (function searchForExpressions(children) {
                    [].slice.call(children).forEach(function (node) {
                        var i, attr, rTokens;
                        if (node.children.length > 0) {
                            // do it recursive for all children
                            searchForExpressions(node.children);
                        }
                        // loop through each attribute
                        for (i = 0; i < node.attributes.length; i++) {
                            attr = node.attributes[i];
                            if (/\{\{/.test(attr.textContent)) {
                                if (attr.name) {
                                    rTokens = (function () {
                                        var token = parse(attr.textContent),
                                            endData = [], tmpToken, j, tmpTokenSplit, value;
                                        for (j = 0; j < token.length; j++) {
                                            tmpToken = token[j];
                                            // if token not itemName skipp all
                                            if (tmpToken.key !== undefined && tmpToken.key.split('.')[0] === itemName) {
                                                // save the attribute
                                                tmpToken.attr = attr;
                                                if (/\./.test(tmpToken.key)) {
                                                    tmpTokenSplit = tmpToken.key.split('.').slice(1).join('.');
                                                } else {
                                                    tmpTokenSplit = tmpToken.key;
                                                }
                                                if (typeof obj === 'object') {
                                                    tmpToken.value = getGlobalCall(tmpTokenSplit, obj);
                                                    if (typeof tmpToken.value === 'function') {
                                                        value = tmpToken.value();
                                                    } else {
                                                        value = tmpToken.value;
                                                    }
                                                } else if (typeof obj === 'string') {
                                                    value = obj;
                                                } else if (typeof obj === 'function') {
                                                    value = obj(node);
                                                }

                                            } else if (tmpToken.hasOwnProperty('key')) {
                                                // restore the expression - might be another whisker instance will
                                                // needs this
                                                value = '{{' + tmpToken.key + '}}';
                                            } else {
                                                value = tmpToken.value;
                                            }
                                            endData.push({value : value, concat : tmpToken.concat});
                                        }
                                        attr.textContent = endData.map(function (d) {
                                            return d.concat ? d.value : ' ' + d.value;
                                        }).join('');
                                        return token;
                                    }());
                                    returnTokens = returnTokens.concat(rTokens);
                                }
                            }
                        }
                    });
                }(containerNode.children));
                return returnTokens;
            }

            /**
             * do the magic for attributes or text nodes
             *
             * @param node
             * @param scopeName
             * @param data
             */
            function fillData(node, scopeName, data) {
                var tokens = [];
                if (typeof data === 'object') {
                    // handleEvents(node, data, scopeName);
                    tokens = tokens.concat(handleAttributes(node, data, scopeName));
                    // replace texts:
                    return tokens.concat(compile(node, data, scopeName));
                } else {
                    console.error('whisker:handleAttributes detect none acceptable data argument', data);
                }
            }

            /**
             * helper function for updateData to update the text nodes
             * @param token
             * @param val
             */
            function updateText(token, val) {

                if (typeof val === 'string' || typeof val === 'number') {
                    token.node.nodeValue = val;
                } else if (typeof val === 'boolean') {
                    // TODO test
                    token.node.nodeValue = val.toString();
                } else if (typeof val === 'function') {
                    // TODO test and implement
                    //    token.node.nodeValue = val(token.node.parentNode);
                }
            }

            /**
             * helper function for updateData to update the attributes for a node
             * @param token
             * @param val
             */
            function updateAttributes(token, val) {
                if (typeof val === 'string' || typeof val === 'number') {
                    var replaceText = token.attr.textContent;
                    if (replaceText) {
                        token.attr.textContent = replaceText.replace(token.value, val);
                        token.value = val;
                    } else {
                        token.attr.textContent = replaceText + val;
                    }
                } else if (typeof val === 'boolean') {
                    // TODO test
                    token.node.nodeValue = val.toString();
                } else if (typeof val === 'function') {
                    // TODO test and implement
                    //    token.node.nodeValue = val(token.node.parentNode);
                }
            }
            /**
             *
             * Call this to update the existing data's
             *
             * TODO test also boolean and function
             *
             * @param tokenObjList [{key : "scopeName.property", node}]
             * @param scopeName
             * @param obj
             */
            function updateData(tokenObjList, scopeName, obj) {
                tokenObjList.forEach(function (token) {
                    if (token && token.hasOwnProperty('key')) {
                        var tmp = token.key.split('.'), tokenObjectProperty, val;
                        if (tmp.length > 0 && tmp[0] === scopeName) {
                            tokenObjectProperty = tmp.slice(1).join('.');
                            if (typeof obj === 'object') {
                                val = getGlobalCall(tokenObjectProperty, obj);
                            } else {
                                val = obj;
                            }

                            if (val !== undefined) {
                                if (token.hasOwnProperty('attr')) {
                                    // handle attribute
                                    updateAttributes(token, val);
                                } else {
                                    updateText(token, val);
                                }
                            }
                        }
                    }
                });
            }

            /**
             * TODO description
             * Create a new whisker instance and do the "magic".
             * @param node
             * @param scopeName
             * @param data
             */
            function exec(node, data, scopeName) {
                var currentScope = scopeName,
                    keyValueholder = {};
                if (typeof data === 'function') {
                    data(function (scope, data) {
                        if (data !== undefined) {
                            currentScope  = scope;
                        } else {
                            data = scope;
                        }
                        if (keyValueholder.hasOwnProperty(scope)) {
                            updateData(keyValueholder[scope], currentScope, data);
                        } else {
                            keyValueholder[scope] = fillData(node, currentScope, data);
                        }
                    });
                } else {
                    fillData(node, currentScope, data)
                }
            }

            return {
                add : function (node, attr) {
                    var inPointer;
                    if (typeof attr === 'object' && attr.to && attr.bind) {
                        if (typeof attr.to === 'string') {
                            // TODO replace window with this and also other instances could use the magic as closure
                            inPointer = getGlobalCall(attr.to, window);
                        } else {
                            inPointer = attr.to;
                        }
                        exec(node, inPointer, attr.bind);
                    } else {
                        inPointer = getGlobalCall(attr, window);
                        if (typeof inPointer === 'function') {
                            exec(node, inPointer);
                        } else {
                            console.warn('whisker:add none acceptable attributes', attr);
                        }
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
    if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
        module.exports = whisker;
    } else {
        canny.add('whisker', whisker);
    }

}());
