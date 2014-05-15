canny.add('asyncCannyMod', (function () {
    "use strict";
    var node;

    return {
        add : function (elem, attr) {
            node = elem;
            Object.keys(attr).forEach(function (prop) {
                var p = document.createElement('p');
                p.innerText = attr[prop];
                node.appendChild(p);
            });
        },
        ready : function () {
            node.classList.add('ready');
        }
    };
}()));