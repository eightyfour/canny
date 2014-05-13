(function () {
    "use strict";
    canny.add('whiskerSample', (function () {
        var node,
            data1 = {
                name : 'whisker',
                text : 'Dynamical included text'
            },
            data2 = function () {
                var n = Math.round(Math.random(0, 10) * 10);
                return {
                    name : 'whisker',
                    text : 'rand: ' + n
                };
            }
        return {
            data1 : data1,
            data2 : function () {
                return data2();
            },
            add : function (elem) {
                node = elem;
            }
        };
    }()));
}());
