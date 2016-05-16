
describe('Check async', function() {

    it('should have async', function () {
        expect(canny.async).toBeDefined();
    });

    describe('and check', function() {

        var mainNode,
            pushCB,
            addCallback;

        beforeAll(function (done) {

            pushCB = {
                once : function (attr) {},
                many : function (attr) {}
            }
            addCallback = {
                called : function (node, attr){}
            }

            spyOn(pushCB, 'once');
            spyOn(pushCB, 'many').and.returnValue(true);
            spyOn(addCallback, 'called');

            canny.async.pushLoadCB(pushCB.once);
            canny.async.pushLoadCB(pushCB.many);

            canny.add('asyncTest', {
                add: addCallback.called,
                ready : function () {
                    // needs a small delay - otherwise the test will fail
                    setTimeout(function() {
                        done();
                    }, 10);
                },
                success: undefined
            });

            mainNode = canny.fixture.load('asyncSpec.html');
        });

        it('should call the add method for each existing DOM node', function () {
            expect(addCallback.called.calls.count()).toEqual(2);
        });

        it('should call the add method with the correct parameter', function () {
            expect(addCallback.called).toHaveBeenCalledWith(mainNode.children[0].children[0], "success");
        });

        it('tracks that pushLoadCB once was called once', function () {
            expect(pushCB.once.calls.count()).toEqual(1);
        });

        it('tracks that pushLoadCB once was called with correct parameter', function () {
            expect(pushCB.once).toHaveBeenCalledWith({url: 'base/spec/fixtures/asyncTest.html'});
        });

        it('tracks that many is called twice', function () {
            expect(pushCB.many.calls.count()).toEqual(2);
        });
    });


    it('should load a json file', function (done) {
        canny.async.doAjax({
            method : 'GET',
            path : 'base/spec/json/asyncTest.json',
            onSuccess : function (json) {
                var data = JSON.parse(json.response);
                expect(data.async).toEqual("success");
                done();
            }
        })
    });
    
    describe('check if loads and initialize correct a HTML snippet with script tag', function() {

        beforeAll(function (done) {
            canny.async.loadHTML(
                document.body, {
                    url: '/base/spec/fixtures/asyncSpecScripts.html'
                }, function () {
                    done();
                });
        });

        it('if module asyncTestScripts it available', function () {
            expect(canny.asyncSpecScripts).toBeDefined();
        });

        it('should have initialized the add method', function () {
            expect(canny.asyncSpecScripts.getState().add).toEqual(true);
        });

        it('should have called the ready method', function () {
            expect(canny.asyncSpecScripts.getState().ready).toEqual(true);
        });
    });

    describe('check if loads and initialize correct a HTML snippet with script tag and different mediaURL', function() {

        it('if module asyncTestScripts it available', function () {
            expect(canny.asyncSpecScripts_mediaURL).toBeDefined();
        });

        it('should have initialized the add method', function () {
            expect(canny.asyncSpecScripts_mediaURL.getState().add).toEqual(true);
        });

        it('should have called the ready method', function () {
            expect(canny.asyncSpecScripts_mediaURL.getState().ready).toEqual(true);
        });

        it('if module asyncTestScripts it available', function () {
            expect(canny.asyncSpecScripts_mediaURL2).toBeDefined();
        });

        it('should have initialized the add method', function () {
            expect(canny.asyncSpecScripts_mediaURL2.getState().add).toEqual(true);
        });

        it('should have called the ready method', function () {
            expect(canny.asyncSpecScripts_mediaURL2.getState().ready).toEqual(true);
        });
    });

    describe('check if replace the link href URL with the correct mediaURL', function() {
        var mainNode;

        beforeAll(function (done) {
            mainNode = document.createElement('div');
            canny.async.loadHTML(
                mainNode, {
                    url: '/base/spec/fixtures/asyncSpecLink_mediaURL.html'
                }, function () {
                    done();
                });
        });

        it('should not modifier the absolute URL', function () {
            var links = mainNode.querySelectorAll('link');
            // http://localhost:9876/base/spec/css/asyncSpecScripts.css
            console.log("asyncSpec:link mediaURL 0:",links[0].href);
            expect(/http:\/\/.*:\d*\/base\/spec\/css\/asyncSpecScripts.css/.test(links[0].href)).toBeTruthy();
        });

        it('should modifier the relative URL', function () {
            var links = mainNode.querySelectorAll('link');
            // http://localhost:9876/base/spec/css/asyncSpecScripts.css
            console.log("asyncSpec:link mediaURL 0:",links[1].href);
            expect(/http:\/\/.*:\d*\/base\/spec\/css\/asyncSpecScripts.css/.test(links[1].href)).toBeTruthy();
        });

    });
    
});
