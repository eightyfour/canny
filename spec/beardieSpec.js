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
        attributes : function (fc) {
            fc({
                id : 'idFoo',
                testClass : 'classFoo'
            })
        },
        attributes2 : function (fc) {
            fc('scope2', {
                testClass : 'bar'
            })
        },
        supportScopes : function (fc) {
            fc('scope1', {
                id : 'foo1',
                testClass : 'classTest1',
                text : 'foo1'
            });
            fc('scope2', {
                id : 'foo2',
                testClass : 'classTest2',
                text : 'foo2'
            });
            fc('scope3', {
                id : 'foo3',
                testClass : 'classTest3',
                text : 'foo3'
            });
        },
        /**
         * save it in scope BUT: if other scope is out of this scope but has the same name it should not be effected by changing this... so
         * save also the node and parse from there.
         *
         * @returns {{changeData: changeData, beardiAPI: beardieAPI}}
         */
        dynamicallyChangeData : (function () {
            var updateBeardie;
            return {
                // call this to change the data and update the DOM
                changeData : function (obj) {
                    updateBeardie('scope', obj);
                },
                // pass this as reference to beardie
                beardieAPI : function (fc) {
                    updateBeardie = fc;
                    updateBeardie('scope', {
                        className : 'init',
                        text : 'initial text',
                        id : 'main'
                    });
                }
            }
        }()),
        sameScopeShouldNotEffected : function (fc) {
            fc('scope', {
                className : 'foo',
                text : 'bar',
                id : 'hoo'
            });
        },
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

    describe('test that dynamically update data works fine so', function () {
        var nodeDynamic, nodeNotEffected;

        beforeAll(function () {
            nodeDynamic = mainNode.querySelector('#dynamicallyChangeData');
            nodeNotEffected = mainNode.querySelector('#sameScopeShouldNotEffected');
        });
        /**
         * the DOM structure for this test is always the same so add the object what you want test and the node
         *
         * @param node
         * @param obj
         */
        function checkDOM(node, obj) {
            var data = node.children;
            expect(data[0].getAttribute('id')).toEqual(obj.id);
            expect(data[0].children[0].className).toEqual(obj.className1);
            expect(data[1].className).toEqual(obj.className2);
            expect(data[1].innerHTML).toEqual(obj.text1);
            expect(data[2].innerHTML).toEqual(obj.text2);
        }

        it('should have the correct initial data', function () {
            checkDOM(nodeDynamic, {
                id : 'main',
                className1 : 'test with init',
                className2 : 'init',
                text1 : 'initial text',
                text2 : 'texts replace initial text inside a text'
            })
        });

        it('should have data with the same scope name but in a different container set correctly', function () {
            checkDOM(nodeNotEffected, {
                id : 'hoo',
                className1 : 'test with foo',
                className2 : 'foo',
                text1 : 'bar',
                text2 : 'texts replace bar inside a text'
            })
        });

        it('should update the text correct from scope', function () {
            canny.beardieSample.dynamicallyChangeData.changeData({
                text : 'a different text'
            });
            checkDOM(nodeDynamic, {
                id : 'main',
                className1 : 'test with init',
                className2 : 'init',
                text1 : 'a different text',
                text2 : 'texts replace a different text inside a text'
            });
        });

        it('should not effect the other scope with same name', function () {
            checkDOM(nodeNotEffected, {
                id : 'hoo',
                className1 : 'test with foo',
                className2 : 'foo',
                text1 : 'bar',
                text2 : 'texts replace bar inside a text'
            })
        });

        //it('should update the attributes correct from scope', function () {
        //    canny.beardieSample.dynamicallyChangeData.changeData({
        //        id : 'main1',
        //        className : 'other'
        //    });
        //    checkDOM(nodeDynamic, {
        //        id : 'main1',
        //        className1 : 'test with other',
        //        className2 : 'other',
        //        text : 'a different text'
        //    });
        //});

        //
        //it('should not effect the other scope with same name', function () {
        //    checkDOM(nodeNotEffected, {
        //        id : 'hoo',
        //        className1 : 'test with foo',
        //        className2 : 'foo',
        //        text : 'bar'
        //    })
        //});

    });


    it('should load the data from a inline object', function () {
        var data = mainNode.querySelector('#checkAttributes').children;
        expect(data[0].getAttribute('id')).toEqual("idFoo");
        expect(data[0].className).toEqual("classFoo");
        expect(data[1].children[0].className).toEqual("test bar");
    });

    it('should support multiple scopes called from same function 3 times with different data', function () {
        var data = mainNode.querySelector('#supportMultipleScopes').children;
        expect(data[0].getAttribute('id')).toEqual("foo1");
        expect(data[0].className).toEqual("classTest1");
        expect(data[0].innerHTML).toEqual("foo foo1");

        expect(data[1].getAttribute('id')).toEqual("foo2");
        expect(data[1].className).toEqual("classTest2");
        expect(data[1].innerHTML).toEqual("foo foo2");

        expect(data[2].getAttribute('id')).toEqual("foo3");
        expect(data[2].className).toEqual("classTest3");
        expect(data[2].innerHTML).toEqual("foo foo3");
    });

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