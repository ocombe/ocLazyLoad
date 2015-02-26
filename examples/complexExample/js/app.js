'use strict';

// Declare app level module which depends on filters, and services
var App = angular.module('app', ['ui.router', 'oc.lazyLoad'])
  .config(function($stateProvider, $locationProvider, $urlRouterProvider, $ocLazyLoadProvider) {
    $urlRouterProvider.otherwise("/");
    $locationProvider.hashPrefix('!');

    // You can also load via resolve
    $stateProvider
      .state('index', {
        url: "/", // root route
        views: {
          "lazyLoadView": {
            controller: 'AppCtrl', // This view will use AppCtrl loaded below in the resolve
            templateUrl: 'partials/main.html'
          }
        },
        resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module
            return $ocLazyLoad.load('js/AppCtrl.js');
          }]
        }
      })
      .state('modal', {
        parent: 'index',
        resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
          loadOcModal: ['$ocLazyLoad', '$injector', '$rootScope', function($ocLazyLoad, $injector, $rootScope) {
            // Load 'oc.modal' defined in the config of the provider $ocLazyLoadProvider
            return $ocLazyLoad.load([
                'bower_components/bootstrap/dist/css/bootstrap.css', // will use the cached version if you already loaded bootstrap with the button
                'bower_components/ocModal/dist/css/ocModal.animations.css',
                'bower_components/ocModal/dist/css/ocModal.light.css',
                'bower_components/ocModal/dist/ocModal.js',
                'partials/modal.html'
              ]).then(function() {
              $rootScope.bootstrapLoaded = true;
              // inject the lazy loaded service
              var $ocModal = $injector.get("$ocModal");
              $ocModal.open({
                url: 'modal',
                cls: 'fade-in'
              });
            });
          }],

          // resolve the sibling state and use the service lazy loaded
          setModalBtn: ['loadOcModal', '$rootScope', '$ocModal', function(loadOcModal, $rootScope, $ocModal) {
            $rootScope.openModal = function() {
              $ocModal.open({
                url: 'modal',
                cls: 'flip-vertical'
              });
            }
          }]
        }
      });

    // Without server side support html5 must be disabled.
    $locationProvider.html5Mode(false);

    // We configure ocLazyLoad to use the lib script.js as the async loader
    $ocLazyLoadProvider.config({
      debug: true,
      events: true,
      modules: [{
        name: 'gridModule',
        files: [
          'js/gridModule.js'
        ]
      }]
    });
  });
