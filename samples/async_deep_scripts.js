canny.add('async_deep_scripts', (function () {
    "use strict";
    var node;
    return {
        add : function (elem, attr) {
            node = elem;
        },
        ready : function () {}
    };
}()));