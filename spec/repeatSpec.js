
describe("Test repeat", function() {

    var div;
    
    beforeAll(function() {
        canny.add('repeatSpecs',{
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
                {className : 'itemClass0'},
                {className : 'itemClass1'}
            ],
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

    it('repeat available', function() {
        expect(canny.repeat).toBeDefined();
    });

    it("dom list string", function() {
        var links = div.querySelector('#qunitList').children;

        expect(links[0].innerHTML).toEqual( "item0");
        expect(links[1].innerHTML).toEqual( "item1");
        expect(links[2].innerHTML).toEqual( "item2");
    });

    it("dom list object", function() {
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

    it("dom list object with function and trigger update", function() {
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

    it("dom list object with click listener", function() {
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

    it("dom list object with class adding", function() {
        var links = div.querySelector('#qunitListObjectAddClass').children;

        expect(links[0].className).toEqual( "itemClass0");
        expect(links[1].className).toEqual( "itemClass1");

    });

    it("Test the if and if-not condition statement", function() {
        var links = div.querySelector('#qunitIfConditionCollection').children;

        expect(links.length).toEqual( 2);
        expect(links[0].innerHTML).toEqual( "foo if true");
        expect(links[1].innerHTML).toEqual( "foo if not false");

    });

    it("Test if condition save object access", function() {
        var links = div.querySelector('#qunitIfConditionObjectExists').children;

        expect(links.length).toEqual( 2);
        expect(links[0].innerHTML).toEqual( "there is no item bar only foo: foo");
        expect(links[1].innerHTML).toEqual( "if bar: barFoo");

    });
});