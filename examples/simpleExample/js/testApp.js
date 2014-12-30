(function() {
  'use strict';
  angular.module("testApp", []).directive("sayHello", function() {
    return {
      scope: {
        to: '@to'
      },
      restrict: "E",
      template: '<p>Hello {{to}}</p>'
    };
  });
})();
