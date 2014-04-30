'use strict';

angular.module('HelloWorld', []).run(['$timeout', function($timeout) {
	$timeout(function() {
		console.log('hello world');
	})
}]).factory('$worldmessage', function() {
	return "Hello World";
});