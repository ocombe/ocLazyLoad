angular.module('app').controller('AppCtrl', ['$scope', '$ocLazyLoad', '$timeout', function($scope, $ocLazyLoad, $timeout) {
	$scope.$on('ocLazyLoad.moduleLoaded', function(e, module) {
		console.log('event module loaded', module);
	});
	$scope.$on('ocLazyLoad.componentLoaded', function(e, component) {
		console.log('event component loaded', component);
	});
	$scope.$on('ocLazyLoad.fileLoaded', function(e, file) {
		console.log('event file loaded', file);
	});
	$scope.loadBootstrap = function() {
		var unbind = $scope.$on('ocLazyLoad.fileLoaded', function(e, file) {
			if(file === 'bower_components/bootstrap/dist/css/bootstrap.css') {
				$scope.bootstrapLoaded = true;
				unbind();
			}
		});
		$scope.bootstrapModule = [
			'bower_components/bootstrap/dist/js/bootstrap.js',
			'bower_components/bootstrap/dist/css/bootstrap.css'
		];
	}

	$scope.loadGridModule = function() {
		$ocLazyLoad.load({
			name: 'gridModule',
			files: [
				'js/gridModule.js',
				'partials/grid.html'
			]
		}).then(function success(data) {
			console.log('loaded', data);
			$scope.gridInclude = 'gridTemplate';
			$scope.gridLoaded = true;
		}, function error(err) {
			console.log(err);
		});
	}
}])