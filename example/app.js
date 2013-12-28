'use strict';

// Declare app level module which depends on filters, and services
var App = angular.module('app', ['ui.router', 'oc.lazyLoad'])
	.config(['$stateProvider', '$locationProvider', '$urlRouterProvider', function($stateProvider, $locationProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise("/");
		$locationProvider.hashPrefix('!');

		//		$stateProvider.state('index', {
		//			url: "/", // root route
		//			views: {
		//				"lazyLoadView": {
		//					//template: '<div oc-lazy-load="\'TestModule\'"></div>'
		//					template: '<div oc-lazy-load="{name: \'TestModule\', files: [\'testModule.js\'], template: \'partials/testLazyLoad.html\'}"></div>'
		//				}
		//			}
		//		});


		// You can also load via resolve
		$stateProvider.state('index', {
			url: "/", // root route
			views: {
				"lazyLoadView": {
					templateUrl: 'partials/testLazyLoad.html'
				}
			},
			resolve: {
				test: ['$ocLazyLoad', function($ocLazyLoad) {
					return $ocLazyLoad.load({
						name: 'TestModule',
						files: ['testModule.js']
					});
				}]
			}
		});


		// Without server side support html5 must be disabled.
		return $locationProvider.html5Mode(false);
	}])
	.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
		$ocLazyLoadProvider.config({
//			modules: [
//				{
//					name: 'TestModule',
//					files: ['testModule.js'],
//					template: 'partials/testLazyLoad.html'
//				}
//			],
			asyncLoader: $script
		});
	}]);