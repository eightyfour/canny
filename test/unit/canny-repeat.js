
QUnit.test('requirements', function() {
    ok(canny, 'canny is available');
    ok(canny.repeat, 'repeat is available');
});

QUnit.test("dom list string", function( assert ) {
    var links = document.getElementById("qunitList").children;

    assert.equal(links[0].innerHTML, "item0");
    assert.equal(links[1].innerHTML, "item1");
    assert.equal(links[2].innerHTML, "item2");
});

QUnit.test("dom list object", function( assert ) {
    var links = document.getElementById("qunitListObject").children;

    assert.equal(links[0].innerHTML, "main1");
    assert.equal(links[1].innerHTML, "foo1");
    assert.equal(links[2].innerHTML, "With before text bar1 and after text.");

    assert.equal(links[3].innerHTML, "main2");
    assert.equal(links[4].innerHTML, "foo2");
    assert.equal(links[5].innerHTML, "With before text bar2 and after text.");

    assert.equal(links[6].innerHTML, "main3");
    assert.equal(links[7].innerHTML, "foo3");
    assert.equal(links[8].innerHTML, "With before text bar3 and after text.");
});

QUnit.test("dom list object with function and trigger update", function( assert ) {
    var links = document.getElementById("qunitListObjectFunction").children;

    assert.equal(links[0].innerHTML, "foo1");
    assert.equal(links[1].innerHTML, "foo2");
    assert.equal(links[2].innerHTML, "foo3");
    // update the values
    repeat.closureFc.changeValues([
        {foo : 'foo4'},
        {foo : 'foo5'},
        {foo : 'foo6'}
    ]);
    // get children again - should have new values
    links = document.getElementById("qunitListObjectFunction").children;
    assert.equal(links[0].innerHTML, "foo4");
    assert.equal(links[1].innerHTML, "foo5");
    assert.equal(links[2].innerHTML, "foo6");
});

QUnit.test("dom list object with click listener", function( assert ) {
    var links = document.getElementById("qunitListObjectClickListener").children;

    assert.equal(links[0].innerHTML, "click me 1");
    assert.equal(links[1].innerHTML, "click me 2");
    // TODO test that the click event is registered and can be executed
//    ok(true, 'foo1 clicked');
//    start();
//    links[0].click();
//    ok(true, 'foo2 clicked');
//    start();
//    links[1].click();

});

QUnit.test("dom list object with class adding", function( assert ) {
    var links = document.getElementById("qunitListObjectAddClass").children;

    assert.ok(links[0].classList.contains("itemClass0"), 'has class itemClass0');
    assert.ok(links[0].classList.contains("foo"), 'has class foo');
    assert.ok(links[1].classList.contains("itemClass1"), 'has class itemClass1');
    assert.ok(links[1].classList.contains("foo"), 'has class foo');

});

QUnit.test("Test the if and if-not condition statement", function( assert ) {
    var links = document.getElementById("qunitIfConditionCollection").children;

    assert.equal(links.length, 2);
    assert.equal(links[0].innerHTML, "foo if true");
    assert.equal(links[1].innerHTML, "foo if not false");

});

QUnit.test("Test if condition save object access", function( assert ) {
    var links = document.getElementById("qunitIfConditionObjectExists").children;

    assert.equal(links.length, 2);
    assert.equal(links[0].innerHTML, "there is no item bar only foo: foo");
    assert.equal(links[1].innerHTML, "if bar: barFoo");

});