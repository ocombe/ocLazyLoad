// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('gridModule', [{name: 'ngGrid', files: ['js/ng-grid.js']}]).controller('GridModuleCtrl', ['$scope', function($scope){
	$scope.myData = [{name: "Moroni", age: 50},
		{name: "Teancum", age: 43},
		{name: "Jacob", age: 27},
		{name: "Nephi", age: 29},
		{name: "Enos", age: 34}];
	$scope.gridOptions = { data: 'myData' };
}]);