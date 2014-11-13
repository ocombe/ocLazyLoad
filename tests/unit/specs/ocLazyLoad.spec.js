/*globals describe, beforeEach, afterEach, inject, module, it, expect, angular */
describe('Module: oc.lazyLoad', function() {
  'use strict';

  var $ocLazyLoad,
    $rootScope;

  describe('with app1', function() {

    beforeEach(function() {
      module('app1');

      inject(function(_$ocLazyLoad_, _$rootScope_) {
        $ocLazyLoad = _$ocLazyLoad_;
        $rootScope = _$rootScope_;
      });
    });

    it('service should be defined', function() {
      expect($ocLazyLoad).toBeDefined();
    });

    it('getModules should be working', function() {
      expect($ocLazyLoad.getModules).toBeDefined();
      expect(angular.isArray($ocLazyLoad.getModules())).toBe(true);
    });

    it('loadedModules should be working', function() {
      expect($ocLazyLoad.getModules()).toEqual(['ng', 'app1', 'oc.lazyLoad']);
    });

    it('isLoaded should be working', function() {
      expect($ocLazyLoad.isLoaded).toBeDefined();
      expect($ocLazyLoad.isLoaded).toThrowError('You need to define the module(s) name(s)');
      expect($ocLazyLoad.isLoaded('app1')).toBe(true); // string arg
      expect($ocLazyLoad.isLoaded(['ng', 'app1'])).toBe(true); // array arg
      expect($ocLazyLoad.isLoaded('noModule')).toBe(false);
      expect($ocLazyLoad.isLoaded(['ng', 'noModule'])).toBe(false);
    });

    it('getModuleConfig should be working', function() {
      expect($ocLazyLoad.getModuleConfig).toBeDefined();
      expect($ocLazyLoad.getModuleConfig).toThrowError('You need to give the name of the module to get');
      expect($ocLazyLoad.getModuleConfig('noModule')).toBe(null);
      expect($ocLazyLoad.getModuleConfig('test')).toEqual({name: 'test', files: []});
    });

    it('setModuleConfig should be working', function() {
      expect($ocLazyLoad.setModuleConfig).toBeDefined();
      expect($ocLazyLoad.setModuleConfig).toThrowError('You need to give the module config object to set');
      expect($ocLazyLoad.setModuleConfig({name: 'test2'})).toEqual({name: 'test2'});
      expect($ocLazyLoad.getModuleConfig('test2')).toEqual({name: 'test2'}); // check if set worked
    });

    it('should be able to lazy load a module', function(done) {
      $ocLazyLoad.load({
        name:'testModule',
        files:['/base/tests/unit/lazyLoad/testModule.js']
      }).then(function(){
        done();
      }, function(err){
        throw err;
      });
      setInterval(function() {
        $rootScope.$digest();
      }, 10);
    })

  });

  describe('failed configs', function() {

    it('should throw an error if js loader is not a function', function() {
      expect(function() {
        angular.module('app2', ['oc.lazyLoad'])
        .config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
          $ocLazyLoadProvider.config({
            jsLoader: ''
          });
        }]);
        module('app2');
        inject(function(_$ocLazyLoad_) {});
      }).toThrowError(/The js loader needs to be a function/);
    });

    it('should throw an error if css loader is not a function', function() {
      expect(function() {
        angular.module('app2', ['oc.lazyLoad'])
        .config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
          $ocLazyLoadProvider.config({
            cssLoader: ''
          });
        }]);
        module('app2');
        inject(function(_$ocLazyLoad_) {});
      }).toThrowError(/The css loader needs to be a function/);
    });

    it('should throw an error if css loader is not a function', function() {
      expect(function() {
        angular.module('app2', ['oc.lazyLoad'])
        .config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
          $ocLazyLoadProvider.config({
            templatesLoader: ''
          });
        }]);
        module('app2');
        inject(function(_$ocLazyLoad_) {});
      }).toThrowError(/The template loader needs to be a function/);
    });

  });

});
