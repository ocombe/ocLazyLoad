angular.module('app1', ['oc.lazyLoad'])
  .config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
      modules: [{
        name: 'test',
        files: []
      }]
    });
  }]);
