// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('testModule', []).controller('TestCtrl', function($scope) {
  console.info('-------  test module ctrl');
}).config(function() {
  console.info('config testModule');
}).config(function() {
  console.info('config 2 testModule');
}).run(function() {
  console.info('run testModule');
});
