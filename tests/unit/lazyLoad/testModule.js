// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
var testModule = angular.module('testModule', []);

// config blocks
testModule.config(function() {
  spy.config('config1');
});

testModule.config(function() {
  spy.config('config2');
});

// run blocks
testModule.run(function() {
  spy.run('run1');
});

testModule.run(function() {
  spy.run('run2');
});

// controllers
testModule.controller('TestCtrl', function($scope) {
  spy.ctrl('ctrl');
});

//
testModule.factory('testService', [function () {
  spy.service('service');
  return {};
}]);

testModule.filter('testFilter', function () {
  spy.filter('filter');
  return function (input) {
    return input;
  }
});

testModule.directive("test", function () {
  spy.directive('directive');
  return {
    restrict: 'E',
    replace: true,
    template: '<div>Test template {{1 + 1}}</div>'
  };
});

// redefine directive to check that both won't be invoked (it would throw a [$compile:multidir] Multiple directives)
testModule.directive("test", function () {
  spy.directive('directive');
  return {
    restrict: 'E',
    replace: true,
    template: '<div>Test template {{1 + 1}}</div>'
  };
});
