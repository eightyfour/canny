
canny.add('flowControlTriggerSameView', (function () {
    "use strict";
    return {
        add : function (elem, attr) {
            elem.addEventListener('click', function () {
                canny.flowControl.show(attr);
            });
        },
        ready : function () {
            console.log('flowControlTriggerSameView ready!');
        }
    };
}()));