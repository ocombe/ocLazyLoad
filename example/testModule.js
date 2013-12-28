'use strict';

angular.module('HelloWorld', []).factory('$message', function() {
	return "Hello World";
});

angular.module('TestModule', ['HelloWorld', 'oc.lazyLoad']).controller('LazyLoadCtrl', ['$scope', '$message', function($scope, $message) {
	$scope.message = $message;
}]);