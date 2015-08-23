canny.add('fixture', {
    load : function(fileName) {
        var div = document.createElement('div');
        $(div).append(readFixtures(fileName));
        canny.cannyParse(div);
        return div;
    }
})