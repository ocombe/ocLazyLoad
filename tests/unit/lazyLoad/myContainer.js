angular.module('myContainer', []).directive('myContainer', function() {
  return {
    restrict: 'E',
    template: '<highlander></highlander>',
    controllerAs: 'vm',
    bindToController: true,
    controller: function($element) {
      var vm = this;
      vm.highlanders = $element[0].getElementsByTagName('highlander');
    }
  };
});
