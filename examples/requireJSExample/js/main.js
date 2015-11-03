require.config({
  baseUrl: 'js/',
  paths: {
    'jquery': 'jquery',
    'angular': 'angular.min',
    'test': 'testmodule',
    'ngGrid': 'ng-grid-2.0.11.debug',
    'ocLazyLoad': '../../../dist/ocLazyLoad.require'
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
require(['test'], function() {
  angular.bootstrap(document.body, ['test']);
});
