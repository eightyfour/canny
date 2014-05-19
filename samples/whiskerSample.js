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
            },
            data3 = {
                user : {
                    name: 'Peter',
                    age: 30
                }
            },
            inputs = (function () {
                var update = [];
                return {
                    value : '',
                    notifierWhisker : function (value) {
                        update.forEach(function (fc) {
                            fc({value: value});
                        });
                    },
                    whiskerUpdate : function (cb) {
                        update.push(cb);
                    }
                };
            }()),
            triggerWhiskerUpdate = (function () {
                var whiskerUpdate = function () {
                        console.log('NOT YET INITIALIZED FROM WHISKER');
                    },
                    data = data2();
                return {
                    // trigger this to update the data
                    updateData : function () {
                        whiskerUpdate(data2());
                    },
                    // part of api to whisker
                    whiskerUpdate : function (cb) {
                        whiskerUpdate = cb;
                    },
                    // object
                    name : data.name,
                    text : data.text
                };
            }()),
            brain = {
                triggerWhiskerUpdate : function (node) {
                    node.addEventListener('click', function () {
                        triggerWhiskerUpdate.updateData();
                    });
                },
                triggerWhiskerInput : function (node) {
                    node.addEventListener('keyup', function () {
                        inputs.notifierWhisker(this.value);
                    });
                }
            };
        return {
            data1 : data1,
            data2 : function () {
                return data2();
            },
            inputs : inputs,
            data3 : data3,
            triggerWhiskerUpdate : triggerWhiskerUpdate,
            add : function (node, attr) {
                if (brain.hasOwnProperty(attr)) {
                    brain[attr](node);
                }
            }
        };
    }()));
}());
