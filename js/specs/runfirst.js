canny.add('runfirst', (function () {

    return {
        add : function () {},
        ready: function () {
            console.log('runfirst read was called');

            describe("Test canny", function() {
                it("exists", function() {
                    expect(canny).not.toBe(undefined);
                });
            });
            window.onload();

        }
    };
}()));

