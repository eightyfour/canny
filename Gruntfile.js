
module.exports = function( grunt ) {

grunt.initConfig({

    pkg: grunt.file.readJSON( 'package.json' ),

    connect: {
        server: {
            options: {
                port: 8000,
                base: '.'
            }
        }
    },

    qunit: {
        all: {
            options: {
                urls: [
                    'http://localhost:8000/test/canny-core.html',
                    'http://localhost:8000/test/canny-repeat.html',
                    'http://localhost:8000/test/canny-async.html'
                ]
            }
        }
    }
});

grunt.loadNpmTasks('grunt-contrib-qunit');
grunt.loadNpmTasks('grunt-contrib-connect');

grunt.registerTask( 'default', ['connect', 'qunit']);

};
