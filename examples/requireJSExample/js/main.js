requirejs.config({
	baseUrl: 'js/',
    paths: {
		'jquery':'jquery',
        'angular': 'angular.min',
        'test': 'testmodule',
        'ngGrid': 'ng-grid-2.0.11.debug',
        'ocLazyLoad':'../../../src/ocLazyLoad'
    },
    shim: {
		'angular': ['jquery'],
		'ocLazyLoad': ['angular'],
		'ngGrid': ['angular'],
		'lazymodule': ['test', 'ngGrid'],
        'test': ['ocLazyLoad']
    }
});

// Start the main app logic.
requirejs(['test'], function() {
    angular.bootstrap(document.body, ['test']);
});
