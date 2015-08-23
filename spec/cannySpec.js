
describe('Check canny', function() {

    var mainNode;

    beforeAll(function () {



        canny.add('dummy', {
            add : function(node, attr) {
                var div = document.createElement('div');
                div.setAttribute('id', 'dummy');
                node.appendChild(div);
            },
            ready : function () { /* test if it is called */ }
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
