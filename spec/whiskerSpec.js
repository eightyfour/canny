canny.add('whiskerSample', (function () {
    var node,
        data1 = {
            name : 'whisker',
            text : 'Dynamical included text'
        },
        data2 = function () {
            return {
                name : 'whisker'
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
            var whiskerUpdate = function () {},
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
        }());
    return {
        /**
         * simple obj
         */
        data1 : data1,
        /**
         * get the object from a function
         */
        data2 : function () {
            return data2();
        },
        inputs : inputs,
        data3 : data3,
        triggerWhiskerUpdate : triggerWhiskerUpdate,
        add : function (node, attr) {}
    };
}()));

describe('Check whisker', function() {

    var mainNode;

    beforeAll(function () {
        mainNode = canny.fixture.load('whiskerSpec.html');
    });

    it('should have whisker', function () {
        expect(canny.whisker).toBeDefined();
    });

    it('should have whisker', function () {
        var data = mainNode.querySelector('#whisker_data1');
        expect(data.innerHTML).toEqual("Hello I'm whisker and I include some texts dynamical: Dynamical included text.");
    });

    it('should load the data from a function', function () {
        var data = mainNode.querySelector('#whisker_data_function').children;
        expect(data[0].innerHTML).toEqual("whisker");
        expect(data[1].innerHTML).toEqual("whisker");
        expect(data[2].innerHTML).toEqual("whisker");
        expect(data[3].innerHTML).toEqual("whisker");
    });

    it('should update the values correctly', function () {
        // TODO
    });
});