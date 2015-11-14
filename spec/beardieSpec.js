canny.add('beardieSample', (function () {
    var node,
        data1 = {
            name : 'beardie',
            text : 'Dynamical included text'
        },
        data2 = function () {
            return {
                name : 'beardie'
            };
        },
        data3 = function (cb) {
            cb({
                user : {
                    name: 'Peter',
                    age: 30
                }
            });
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
        triggerUpdate = (function () {
            var update = function () {},
                data = data2();

            return {
                // trigger this to update the data
                updateData : function () {
                    update('data', {
                        name : 'foo2',
                        text : 'bar2'
                    });
                },
                // part of api to beardie
                data : function (fc) {
                    update = fc;
                    fc('data', {
                        name : 'foo1',
                        text : 'bar1'
                    });
                }
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
        data2 : function (fc) {
            fc(data2());
        },
        inputs : inputs,
        data3 : data3,
        data4 : function (fc) {
            fc('scope2', {
                name : 'birdy',
                age : 0
            })
        } ,
        triggerUpdate : triggerUpdate,
        add : function (node, attr) {}
    };
}()));

describe('Check beardie', function() {

    var mainNode;

    beforeAll(function () {
        mainNode = canny.fixture.load('beardieSpec.html');
    });

    it('should have beardie', function () {
        expect(canny.beardie).toBeDefined();
    });

    describe('loadFromObject', function () {
        var node;

        beforeAll(function () {
            node = mainNode.querySelector('#loadFromObject');
        });

        it('should add the normal text to each strong', function () {
            var data = node.children[0].children;
            expect(data[0].innerHTML).toEqual("Peter");
            expect(data[1].innerHTML).toEqual("30");
        });

        it('should not remove the other expression', function () {
            var data = node.children[1];
            expect(data.innerHTML).toEqual("And this expression should stay: {{scopeX.foo}}.");
        });

        it('should have replaced the inner expression from a other scope correctly', function () {
            var data = node.children[2].children[0];
            expect(data.innerHTML).toEqual("Hello I'm birdy and I'm 0 years old.");
        });
    });

//
//    it('should load the data from a inline object', function () {
//        var data = mainNode.querySelector('#ẗestInnerJSON').children;
//        expect(data[0].innerHTML).toEqual("My name is Carlo");
//        expect(data[1].innerHTML).toEqual("And here are my message: bar");
//    });
//
//    it('should update the values correctly', function () {
//        // TODO
//    });
//
//    it('should not replace unkown placeholder', function () {
//        var data = mainNode.querySelector('#testExpressionStayIfNotExists').children;
//        expect(data[0].innerHTML).toEqual("My name is Carlo");
//        expect(data[1].innerHTML).toEqual("And this should stay {{message}}");
//    });
});