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

// services
testModule.factory('testService', [function () {
  spy.service('service');
  return {};
}]);

// filters
angular.module('testModule').filter('testFilter', function () {
  spy.filter('filter');
  return function (input) {
    return input;
  }
});

// directives
testModule.directive("test", function () {
  spy.directive('directive');
  return {
    restrict: 'E',
    replace: true,
    template: '<div>Test template {{1 + 1}}</div>'
  };
});

if(angular.version.minor > 3) { // only in angular 1.4+
    // decorators
    testModule.decorator("testService", function($delegate) {
        spy.decorator('decorator');
        return $delegate;
    });
}

// redefine directive to check that both won't be invoked (it would throw a [$compile:multidir] Multiple directives)
testModule.directive("test", function () {
  spy.directive('directive');
  return {
    restrict: 'E',
    replace: true,
    template: '<div>Test template {{1 + 1}}</div>'
  };
});

// constants
testModule.constant("myConst0", {bar: 'foo'});
testModule.constant("myConst1", "something");
testModule.constant("myConst2", undefined);
testModule.constant("myConst3", null);
testModule.constant("myConst4", function() {});
