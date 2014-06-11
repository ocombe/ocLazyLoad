'use strict';

angular.module('app').controller('LateCtrl', ['$scope', function($scope) {
	$scope.testValue = 'Via a lazy loaded Ctrl';
}]);