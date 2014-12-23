angular.module('test', ['oc.lazyLoad'])
	.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
		$ocLazyLoadProvider.config({
			loadedModules: ['test'],
			jsLoader: requirejs,
			debug: true
		});
}])
	.controller('mainController', ['$scope', '$ocLazyLoad', function($scope, $ocLazyLoad) {
		$scope.test = "Hi there";
		$scope.partialUrl = '';

		$scope.load = function() {
			$ocLazyLoad.load({
				name: 'lazymodule',
				files: ['lazymodule']
			}).then(function() {
				$scope.partialUrl = 'partials/grid.html';
			}, function(e){
				console.log(e);
			});
		}

}]);
