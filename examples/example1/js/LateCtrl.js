'use strict';

angular.module('TestModule').controller('LateCtrl', ['$scope', function($scope) {
	$scope.testValue = 'Via a lazy loaded Ctrl';
}]);