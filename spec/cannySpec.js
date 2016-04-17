
describe('Check canny', function() {

    var mainNode;

    beforeAll(function () {


        canny.add('parseSingleQuotes', {
                add: function (node, attr) {
                    this.text = attr.textWithSingleQuotes;
                }
        });

        canny.add('parseDoubleQuotes', {
                add: function (node, attr) {
                    this.value = attr.value;
                }
        });

        canny.add('parseDoubleQuotesASCII', {
                add: function (node, attr) {
                    this.value = attr.value;
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

        canny.add('testObjectWithArrayInside', {
                add: function (node, attr) {
                    this.list = attr.list;
                }
        });

        canny.add('testArrayDoubleQuotes', {
            add: function (node, attr) {
                this.list = attr;
            }
        });
        canny.add('testArrayDoubleQuotesASCII', {
            add: function (node, attr) {
                this.list = attr;
            }
        });

        canny.add('testArray', {
            add: function (node, attr) {
                this.list = attr;
            }
        });

        canny.add('testArrayWithSingleQuoteInside', {
            add: function (node, attr) {
                this.list = attr;
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

    it('should escape double quotes in JSON', function () {
        expect(canny.parseDoubleQuotes.value).toEqual('true');
    });

    it('should escape double ASCII quotes in JSON', function () {
        expect(canny.parseDoubleQuotesASCII.value).toEqual('true');
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

    it('should parse array in object correctly', function () {
        expect(canny.testObjectWithArrayInside.list).toEqual(['foo','boo','jahuu']);
    });

    it('should parse array in object correctly', function () {
        expect(canny.testArray.list).toEqual(['foo','boo','jahuu']);
    });

    it('should parse array in object correctly', function () {
        expect(canny.testArrayDoubleQuotes.list).toEqual(['foo','boo','jahuu']);
    });

    it('should parse array in object correctly', function () {
        expect(canny.testArrayDoubleQuotesASCII.list).toEqual(['foo','boo','jahuu']);
    });

    it('should parse array in object correctly', function () {
        expect(canny.testArrayWithSingleQuoteInside.list).toEqual(['foo\'s','boo\'s','jahuu\'s']);
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
