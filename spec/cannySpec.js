
describe('Check canny', function() {

    var mainNode;

    beforeAll(function () {


        canny.add('parseSingleQuotes', {
                add: function (node, attr) {
                    this.text = attr.textWithSingleQuotes;
                }
        });

        canny.add('parseWhiteSpacesCorrectInJSON', {
                add: function (node, attr) {
                    var ctx = this;
                    Object.keys(attr).forEach(function (key) {
                        ctx[key] = attr[key];
                    });
                }
        });

        canny.add('dummy', {
            add : function(node, attr) {
                var div = document.createElement('div');
                div.setAttribute('id', 'dummy');
                node.appendChild(div);
            },
            ready : function () { /* test if it is called */ }
        });

        canny.add('testStringToBeNotAJSON1', {
                add: function (node, attr) {
                    this.text = attr;
                }
        });
        canny.add('testStringToBeNotAJSON2', {
                add: function (node, attr) {
                    this.text = attr;
                }
        });

        canny.add('notInDom', {
            add : function (node, attr) {},
            ready : function () { /* test if it is NOT called */ }
        });

        canny.ready(function () {
           console.log('cannySpec should be called once');
        });

        mainNode = canny.fixture.load('cannySpec.html');
    });

    it('should have canny', function () {
        expect(canny).toBeDefined();
    });

    it('should have added the modules dummy and notInDom', function () {
        expect(canny.dummy).toBeDefined();
        expect(canny.notInDom).toBeDefined();
    });

    it('should call the add method from module with string', function () {
        // instead of this check if the add method is expect to be called with the correct attribute
        var node = mainNode.querySelector('#dummy');
        expect(node.getAttribute('id')).toEqual('dummy');
    });

    it('should escape single quotes in JSON', function () {
          expect(canny.parseSingleQuotes.text).toEqual('Hey I\'m a text');
    });

    it('should parse JSON with white spaces correctly', function () {
          expect(canny.parseWhiteSpacesCorrectInJSON.t1).toEqual('Hey I\'m a text');
          expect(canny.parseWhiteSpacesCorrectInJSON.t2).toEqual('foo   2');
          expect(canny.parseWhiteSpacesCorrectInJSON.t3).toEqual('bar     3');
    });

    it('should detect a string as a string', function () {
          expect(canny.testStringToBeNotAJSON1.text).toEqual('I\'ve a : in my text');
    });

    it('should detect a string as a string', function () {
          expect(canny.testStringToBeNotAJSON2.text).toEqual('Foo{ bar : boo}  ');
    });

    it('should call the add method from module with object', function () {
        // TODO
    });

    it('should call the ready method from canny', function () {
        // TODO
    });

    it('should call the ready method module', function () {
        // TODO
    });

    it('should NOT called the ready method from modules which are not in DOM', function () {
        // TODO
    });
})
