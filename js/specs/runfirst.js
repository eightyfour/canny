canny.add('runfirst', (function () {

    var async_deep_scripts = function () {
        describe("Test async_deep_scripts", function () {
            it("exists", function () {
                expect(canny.async_deep_scripts).not.toBeUndefined();
            });
        });
    };

    return {
        add : function () {},
        ready: function () {
            console.log('runfirst read was called');

            describe("Test canny", function () {
                it("exists", function () {
                    expect(canny).not.toBeUndefined();
                });
            });
            async_deep_scripts();

            // start the jasmine test - not really common needs to be fixed ( but jasmine can't handle async loading - or I'vnt seen it )
            window.onload();

        }
    };
}()));

