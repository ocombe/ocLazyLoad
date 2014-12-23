// set app1 as the bootstrap module
document.querySelector('html').setAttribute('ng-app','app1');

angular.module('app1', ['oc.lazyLoad'])
  .config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
      modules: [{
        name: 'test',
        files: []
      }]
    });
  }]);
