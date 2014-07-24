
test('requirements', function() {
    ok(canny, 'canny is available');
    ok(canny.async, 'async is available');
});

asyncTest('async load', function() {
    expect( 1 );
    canny.async.load('data/test.html', function (src) {
        ok(true, 'test.html loaded');
        start();
    });
});