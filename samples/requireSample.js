(function () {
    "use strict";
    canny.add('requireSample', (function () {

        return {
            add : function (elem, attr) {
                console.log('ADD requireSample');
                elem.style.backgroundColor = attr;
            },
            ready : function () {
                console.log('requireSample READY');
            }
        };
    }()));
}());
