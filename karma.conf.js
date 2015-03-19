module.exports = function(config) {
    config.set(module.exports.conf);

    if(process.env.TRAVIS) {
        config.logLevel = config.LOG_DEBUG;
        config.captureTimeout = 0; // rely on SL timeout
    }
};

module.exports.conf = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
        'bower_components/angular/angular.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'src/ocLazyLoad.polyfill.ie8.js',
        'src/ocLazyLoad.core.js',
        'src/ocLazyLoad.directive.js',
        'src/ocLazyLoad.loaders.core.js',
        'src/ocLazyLoad.loaders.common.js',
        'src/ocLazyLoad.loaders.jsLoader.js',
        'src/ocLazyLoad.loaders.cssLoader.js',
        'src/ocLazyLoad.loaders.templatesLoader.js',
        'tests/unit/**/*.spec.js',
        'tests/unit/**/*.mock.js',
        {pattern: 'tests/unit/lazyLoad/**/*', included: false}
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'src/**/*.js': ['babel', 'coverage']
    },

    'babelPreprocessor': {
        options: {
            sourceMap: 'inline'
        }
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // we use Firefox because it's the only one available in travis
    browsers: ['Firefox'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Increase timeout in case connection in CI is slow
    captureTimeout: 120000,

    browserDisconnectTimeout: 10000,

    browserDisconnectTolerance: 2,

    browserNoActivityTimeout: 30000
};
