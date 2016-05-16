canny.add('asyncSpecScripts_mediaURL', function () {
    var add = false,
        ready = false;

    return {
        getState : function (){
            return {
                add: add,
                ready : ready
            }
        },
        add : function () {
            add = true;
        },
        ready : function () {
            ready = true;
        }
    }
});