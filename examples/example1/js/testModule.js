'use strict';

angular.module('TestModule', [
        'HelloWorld',   // Pre defined in app.js
        {               // Defined at runtime!
            name: 'HelloUniverse',
            files: ['js/helloUniverseModule.js']
        }
    ]).
	config(function() {
		console.log('TestModule::config');
	})
	.controller('LazyLoadCtrl', ['$scope', '$worldmessage', '$universemessage', function($scope, $worldmessage, $universemessage) {
	    $scope.worldmessage = $worldmessage;
        $scope.universemessage = $universemessage;
    }]);