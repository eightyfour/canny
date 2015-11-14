
describe("Test repeat", function () {

    var div;

    beforeAll(function () {
        canny.add('repeatSpecs', {
            list : ['item0', 'item1', 'item2'],
            listObj : [{
                main:'main1',
                bar:{foo1 : 'foo1', bar1 : 'bar1'}
            },{
                main:'main2',
                bar:{foo1 : 'foo2', bar1 : 'bar2'}
            },{
                main:'main3',bar:
                {foo1 : 'foo3', bar1 : 'bar3'}
            }],
            // all trailing zeros will be removed in the view - so if you need them pass the float as string
            listOfObjectsWithNumbers : [
                {var1 : 1, var2 : 2},
                {var1 : 3.2000, var2 : "3.0000"},
                // 2.001 will work but be careful with that
                {var1 : 1.00, var2 : 2.001}
            ],
            listOfFunctions : [
                function () {return 'fc1'},
                function () {return 'fc2'},
                function () {return 'fc3'},
            ],
            objectMap : {
                data1 : {}
            },
            listWithDeepObjectMap : [
                {
                    data : {
                        foo : 'foo1',
                        bar : 'bar1'
                    }
                },
                {
                    data : {
                        foo : 'foo2',
                        bar : 'bar2'
                    }
                }
            ],
            closureFc : (function () {
                var triggerRepeat;
                return {
                    changeValues : function (list) {
                        triggerRepeat(list);
                    },
                    listObjFunction : function (cb) {
                        triggerRepeat = cb;
                        triggerRepeat([
                            {foo : 'foo1'},
                            {foo : 'foo2'},
                            {foo : 'foo3'}
                        ])
                    }
                }
            }()),
            clickListener : [
                {foo : 'click me 1', clickMe : function () { console.log('canny-repeat: foo1 clicked'); }},
                {foo : 'click me 2', clickMe : function () { console.log('canny-repeat: foo2 clicked');}}
            ],
            addClasses : [
                {className : 'itemClass0 foo'},
                {className : 'itemClass1 foo'}
            ],
            customAttributes : [
                {attr1 : 'foo1', attr2 : 'bar1'},
                {attr1 : 'foo2', attr2 : 'bar2'}
            ],
            imageSrc : ['/image/foo.png', '/image/bar.png', 'http://image.de/image/foo.png'],
            functionTest : (function () {
                var triggerRepeat;
                return {
                    changeValues : function (list) {
                        triggerRepeat(list);
                    },
                    functionPointer : function (cb) {
                        triggerRepeat = cb;
                    }
                }
            }()),
            conditions : [
                {foo : true},
                {foo : false}
            ],
            conditionsWithMissingProperties : [
                {foo : 'foo'},
                {foo : 'foo', bar: {barFoo : 'barFoo'}}
            ]
        });

        div = canny.fixture.load('repeatSpec.html');
    });

    it('repeat available', function () {
        expect(canny.repeat).toBeDefined();
    });

    it("dom list string", function () {
        var links = div.querySelector('#qunitList').children;

        expect(links[0].innerHTML).toEqual( "item0");
        expect(links[1].innerHTML).toEqual( "item1");
        expect(links[2].innerHTML).toEqual( "item2");
    });

    it("dom list string", function () {
        var li = div.querySelector('#qunitRenderPlainNumbers').children;

        expect(li[0].innerHTML).toEqual( "1 : 2");
        expect(li[1].innerHTML).toEqual( "3.2 : 3.0000");
        // so if you
        expect(li[2].innerHTML).toEqual( "1 : 2.001");
    });

    it("dom list object", function () {
        var links = div.querySelector('#qunitListObject').children;

        expect(links[0].innerHTML).toEqual( "main1");
        expect(links[1].innerHTML).toEqual( "foo1");
        expect(links[2].innerHTML).toEqual( "With before text bar1 and after text.");

        expect(links[3].innerHTML).toEqual( "main2");
        expect(links[4].innerHTML).toEqual( "foo2");
        expect(links[5].innerHTML).toEqual( "With before text bar2 and after text.");

        expect(links[6].innerHTML).toEqual( "main3");
        expect(links[7].innerHTML).toEqual( "foo3");
        expect(links[8].innerHTML).toEqual( "With before text bar3 and after text.");
    });

    it("dom list object", function () {
        var links = div.querySelector('#listWithDeepObjectMap').children;

        expect(links[0].innerHTML).toEqual( "foo1");
        expect(links[1].innerHTML).toEqual( "bar1");

        expect(links[2].innerHTML).toEqual( "foo2");
        expect(links[3].innerHTML).toEqual( "bar2");
    });

    it("dom list object with function and trigger update", function () {
        var links = div.querySelector('#qunitListObjectFunction').children;

        expect(links[0].innerHTML).toEqual( "foo1");
        expect(links[1].innerHTML).toEqual( "foo2");
        expect(links[2].innerHTML).toEqual( "foo3");
        // update the values
        canny.repeatSpecs.closureFc.changeValues([
            {foo : 'foo4'},
            {foo : 'foo5'},
            {foo : 'foo6'}
        ]);
        // get children again - should have new values
        links = div.querySelector('#qunitListObjectFunction').children;
        expect(links[0].innerHTML).toEqual( "foo4");
        expect(links[1].innerHTML).toEqual( "foo5");
        expect(links[2].innerHTML).toEqual( "foo6");
    });

    it("dom list object with click listener", function () {
        var links = div.querySelector('#qunitListObjectClickListener').children;

        expect(links[0].innerHTML).toEqual( "click me 1");
        expect(links[1].innerHTML).toEqual( "click me 2");
        // TODO test that the click event is registered and can be executed
    //    ok(true, 'foo1 clicked');
    //    start();
    //    links[0].click();
    //    ok(true, 'foo2 clicked');
    //    start();
    //    links[1].click();

    });

    it("dom list object with class adding", function () {
        var links = div.querySelector("#qunitListObjectAddClass").children;

        expect(links[0].classList.contains("itemClass0")).toBe(true);
        expect(links[0].classList.contains("foo")).toBe(true);
        expect(links[1].classList.contains("itemClass1")).toBe(true);
        expect(links[1].classList.contains("foo")).toBe(true);

    });

     it("it should read the data from a list of functions", function () {
         var links = div.querySelector("#qunitListOfFunctions").children;

         expect(links[0].classList.contains("fc1")).toBe(true);
         expect(links[0].innerHTML).toEqual( "fc1");

         expect(links[1].classList.contains("fc2")).toBe(true);
         expect(links[1].innerHTML).toEqual( "fc2");

         expect(links[2].classList.contains("fc3")).toBe(true);
         expect(links[2].innerHTML).toEqual("fc3");

     });

    it("dom list object with class adding with existing classes", function () {
        var links = div.querySelector("#qunitListObjectAddClass2").children;

        expect(links[0].classList.contains("itemClass0")).toBe(true);
        expect(links[0].classList.contains("foo")).toBe(true);
        // static class is already in the DOM and should not be removed
        expect(links[0].classList.contains("prevClass")).toBe(true);
        // static class is already in the DOM and should not be removed
        expect(links[0].classList.contains("nextClass")).toBe(true);
        expect(links[1].classList.contains("itemClass1")).toBe(true);
        expect(links[1].classList.contains("foo")).toBe(true);
        // static class is already in the DOM and should not be removed
        expect(links[1].classList.contains("prevClass")).toBe(true);
        // static class is already in the DOM and should not be removed
        expect(links[1].classList.contains("nextClass")).toBe(true);

    });

    it("dom list object with multiple custom attributes", function () {
        var links = div.querySelector("#qunitListTestCustomAttributes").children;

        expect(links[0].classList.contains("foo1")).toBe(true);
        expect(links[0].classList.contains("bar1")).toBe(true);
        expect(links[0].getAttribute('id')).toEqual("foo1");

        expect(links[1].classList.contains("foo2")).toBe(true);
        expect(links[1].classList.contains("bar2")).toBe(true);
        expect(links[1].getAttribute('id')).toEqual("foo2");

    });

    it("it should render the DOM for all attributes for each callback function", function () {
        var li;
        canny.repeatSpecs.functionTest.changeValues([
            {id : 'id1', attr : 'attr1'},
            {id : 'id2', attr : 'attr2'}
        ]);

        li = div.querySelector("#qunitListFunction").children;
        expect(li[0].getAttribute('id')).toEqual('id1');
        expect(li[0].classList.contains("attr1")).toBe(true);
        expect(li[0].classList.contains("staticClass")).toBe(true);
        expect(li[0].innerHTML).toBe('id1');

        expect(li[1].getAttribute('id')).toEqual('id2');
        expect(li[1].classList.contains("attr2")).toBe(true);
        expect(li[1].classList.contains("staticClass")).toBe(true);
        expect(li[1].innerHTML).toBe('id2');
        // render the items again with new values
        canny.repeatSpecs.functionTest.changeValues([
            {id : 'id3', attr : 'attr3'},
            {id : 'id4', attr : 'attr4'}
        ]);

        expect(li[0].getAttribute('id')).toEqual('id3');
        expect(li[0].classList.contains("attr3")).toBe(true);
        expect(li[0].classList.contains("staticClass")).toBe(true);
        expect(li[0].innerHTML).toBe('id3');

        expect(li[1].getAttribute('id')).toEqual('id4');
        expect(li[1].classList.contains("attr4")).toBe(true);
        expect(li[1].classList.contains("staticClass")).toBe(true);
        expect(li[1].innerHTML).toBe('id4');

    });

    it("dom simple list with src attributes", function () {
        var images = div.querySelector("#qunitListObjectImages").children;
        expect(images[0].getAttribute('src')).toEqual(canny.repeatSpecs.imageSrc[0]);
        expect(images[1].getAttribute('src')).toEqual(canny.repeatSpecs.imageSrc[1]);
        expect(images[2].getAttribute('src')).toEqual(canny.repeatSpecs.imageSrc[2]);
    });

    it("Test the if and if-not condition statement", function () {
        var links = div.querySelector('#qunitIfConditionCollection').children;

        expect(links.length).toEqual( 2);
        expect(links[0].innerHTML).toEqual( "foo if true");
        expect(links[1].innerHTML).toEqual( "foo if not false");

    });

    it("Test if condition save object access", function () {
        var links = div.querySelector('#qunitIfConditionObjectExists').children;

        expect(links.length).toEqual( 2);
        expect(links[0].innerHTML).toEqual( "there is no item bar only foo: foo");
        expect(links[1].innerHTML).toEqual( "if bar: barFoo");

    });
});