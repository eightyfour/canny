
canny.add('flowControlInstanceCallDeepView', canny.flowControl.createNewInstance('flowControlInstanceCallDeepView'));

canny.add('flowControlCallDeepView', (function () {
    "use strict";
    function CheckBox(node) {
        this.node = node;
    }
    var checkbox = {};
    return {
        add : function (elem, attr) {
            if (typeof attr === 'object' && attr.hasOwnProperty('checkbox')) {
                elem.setAttribute('value', attr['checkbox']);
                elem.innerHTML = attr['checkbox'];
                checkbox[attr['checkbox']] = new CheckBox(elem);
            } else {
                console.log('REGISTER CLICK');
                elem.addEventListener('click', function () {
                    var boxes = Object.keys(checkbox),
                        ar = [attr];
                    boxes.forEach(function (checkBox) {
                        var value;
                        if (checkbox[checkBox].node.checked) {
                            ar.push(checkbox[checkBox].node.getAttribute('value'));
                        }
                    });
                    console.log('DO SHOW');
                    canny.flowControlInstanceCallDeepView.show.apply(null, ar);
                });
            }
        },
        ready : function () {
            console.log('flowControlCallDeppView ready!');
        }
    };
}()));
