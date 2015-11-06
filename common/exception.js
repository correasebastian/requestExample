module.exports = (function() {
    var services = {
        catcher: catcher,
        catcherQueue: catcherQueue
    };

    return services;

    function catcher(msg) {
        function innerError(error) {
            console.log(msg, error);

        }
        return innerError;
    }

    function catcherQueue(msg, reject) {
        function innerError(error) {
            console.log(msg, error);
            reject(error);

        }
        return innerError;
    }
})();
