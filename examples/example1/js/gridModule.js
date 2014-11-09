// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('gridModule', [{
  name: 'ui.grid.rowEdit', files: [
    'bower_components/angular-ui-grid/ui-grid.js',
    'bower_components/angular-ui-grid/ui-grid.css'
  ]
}]).controller('GridModuleCtrl', function($scope) {
  console.log('-------  grid module ctrl');
  $scope.myData = [{name: "Moroni", age: 50},
    {name: "Teancum", age: 43},
    {name: "Jacob", age: 27},
    {name: "Nephi", age: 29},
    {name: "Enos", age: 34}];
  $scope.gridOptions = {data: 'myData'};
}).config(function() {
  console.warn('config gridModule');
}).config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
  console.warn('config 2 gridModule');
}]).run(function() {
  console.warn('run gridModule');
});
