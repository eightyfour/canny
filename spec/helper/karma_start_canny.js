window.__karma__.start = (function (originalStartFn) {
    return function () {
        var args = arguments;
        canny.ready(function () {
            originalStartFn.apply(null, args);
        });
    };
}(window.__karma__.start));