/*global canny */
/*jslint browser: true*/

/**
 * repeat
 *
 * E.g.
 *  <div canny-mod="repeat" canny-var="{'for':'item', 'in':'path.to.list'}">
 *     <p>DATA: {{item}})</p>
 *  </div>
 *  or:
 *  <div canny-mod="repeat" canny-var="{'for':'objectItem', 'in':'path.to.object'}">
 *     <p>DATA FOO: {{objectItem.foo}})</p>
 *     <p>DATA BAR: {{objectItem.bar}})</p>
 *  </div>
 *
 * for:
 * is the name of the iterating item to have access from the DOM.
 *
 * in:
 * is the source where repeat can find the array.
 * It accepts functions, array, and objects pointer
 * - object: keep in mind that object has no specific sorting
 * - array:
 * - function: repeat will call it with the following parameter:
 *  * function which needs to be called with the object or list
 *  * ...
 *
 */
(function () {
    "use strict";

    var openChar = '{',
        endChar  = '}',
        ESCAPE_RE = /[-.*+?^${}()|[\]\/\\]/g,
        repeat = (function () {
            var BINDING_RE = getRegex();

            /**
             *  Parse a piece of text, return an array of tokens
             *  @param text
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
             * @param textNode
             * @param obj
             * @param itemName
             */
            function compileTextNode(textNode, obj, itemName) {
                var tokens = parse(textNode.nodeValue), el, token, val, i, l, tmp, tokenObjectProperty,
                    tmpObj = {};

                tmpObj[itemName] = obj;

                if (!tokens || obj === undefined) {return; }

                for (i = 0, l = tokens.length; i < l; i++) {
                    token = tokens[i];
                    if (typeof token === 'object') {
                        tmp = token.key.split('.');
                        if (tmp.length > 0 && tmp[0] === itemName) {
                            tokenObjectProperty = tmp.slice(1).join('.');
                            val = getGlobalCall(tokenObjectProperty, obj);
                        } else {
                            // just a string?
                            val = obj;
                        }
                        if (typeof val === 'string') {
                            el = document.createTextNode(val);
                            textNode.parentNode.insertBefore(el, textNode);
                        } else {
                            console.error('repeat: can not find property "' + tokenObjectProperty + '" for object', obj);
                        }
                    } else {
                        el = document.createTextNode(token);
                        // just normal string put back to view
                        textNode.parentNode.insertBefore(el, textNode);
                    }

                }
                textNode.parentNode.removeChild(textNode);
            }
            /**
             *
             * @param node
             * @param dataObj
             * @param itemName
             */
            function compileElement (node, dataObj, itemName) {
                // recursively compile childNodes
                if (node.hasChildNodes()) {
                    [].slice.call(node.childNodes).forEach(function (child) {
                        compile(child, dataObj, itemName);
                    });
                }
            }
            /**
             * Compile a DOM node (recursive)
             * @param node
             * @param dataObj
             * @param itemName
             * @returns {*}
             */
            function compile(node, dataObj, itemName) {
                var nodeType = node.nodeType;
                if (nodeType === 1 && node.tagName !== 'SCRIPT') { // a normal node
                    compileElement(node, dataObj, itemName);
                } else if (nodeType === 3) {
                    compileTextNode(node, dataObj, itemName);
                }

                return node;
            }
            /**
             *
             * @param clone
             * @param item
             * @param itemName
             */
            function handleEvents(clone, obj, itemName) {
                var onClick = 'on-click';

                function registerClick(node) {
                    var tmp = node.getAttribute(onClick).split('.'), tokenObjectProperty, val;

                    if (tmp.length > 0 && tmp[0] === itemName) {
                        tokenObjectProperty = tmp.slice(1).join('.');
                        val = getGlobalCall(tokenObjectProperty, obj);
                        if (typeof val === 'function') {
                            node.addEventListener('click', val);
                        } else {
                            console.log('repeat:can not register click listener without a function', tokenObjectProperty);
                        }
                    }
                }
                // check own clone (can't select parent - this will select all children in the repeat)
                if (clone.hasAttribute(onClick)) {
                    registerClick(clone);
                }
                // check children of clone
                [].slice.call(clone.querySelectorAll(onClick)).forEach(registerClick);
            }
            /**
             *
             * @param node
             * @param itemName
             * @param data
             * @param template
             */
            function registerTemplate(node, itemName, data, template) {
                if (typeof data === 'object') {
                    if (Object.prototype.toString.call(data) === '[object Array]') {
                        // it is an array
                        // TODO functions in array could also be registered as click listeners
                        data.forEach(function (item) {
                            template.forEach(function (childTpl) {
                                var clone = childTpl.cloneNode(true);
                                node.appendChild(compile(clone, item, itemName));
                                handleEvents(clone, item, itemName);
                            });
                        });
                    } else {
                        // it is an object
                        console.error('repeat detect object but object currently not supported');
                        // what render? - property name or value? - Both?
                    }

                } else {
                    console.error('repeat:newRepeat detect none acceptable data argument', data);
                }
            }

            function newRepeat(node, itemName, data) {
                // for te first it accepts only one child
                var template = [];
                [].slice.call(node.children).forEach(function (child) {
                    template.push(node.removeChild(child));
                });

                if (typeof data === 'function') {
                    // TODO - this will be the magic ;-)
//                    console.log('repeat:detect function');
                    data(function (data) {
                        // better would be a update children but this is much effort to detect
                        [].slice.call(node.children).forEach(function (child) {
                            node.removeChild(child);
                        });
                        registerTemplate(node, itemName, data, template);
                    });
                } else {
                    registerTemplate(node, itemName, data, template)
                }

            }

            return {
                /**
                 * the attribute requires:
                 *  for: name of the iterator
                 *  in: pointer to: function, array or object
                 *
                 * @param node
                 * @param attr {{for:string,in:string}}
                 */
                add : function (node, attr) {
                    var inPointer;
                    if (typeof attr === 'object' && attr.in && attr.for) {
                        if (typeof attr.in === 'string') {
                            inPointer = getGlobalCall(attr.in, window);
                        } else {
                            inPointer = attr.in;
                        }
                        newRepeat(node, attr.for, inPointer);
                    } else {
                        console.warn('repeat:add none acceptable attributes', attr);
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

    function getGlobalCall (value, end) {
        var split = value.split('.'),
            rec = function (cur) {
                if (end[cur]) {
                    end = end[cur];
                    rec(split.shift());
                }
            };
        rec(split.shift());
        return end;
    }

    // export as module or bind to global
    if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
        module.exports = repeat;
    } else {
        canny.add('repeat', repeat);
    }

}());
