describe('Module: oc.lazyLoad', function() {
    'use strict';

    var $ocLazyLoad,
        $rootScope,
        $controller,
        $injector,
        $filter,
        $compile,
        $httpBackend,
        $log,
        element,
        lazyLoadUrl = '/base/tests/unit/lazyLoad/',
        triggerDigests = function() {
            return setInterval(function() {
                $rootScope.$digest();
            }, 10)
        };

    describe('with app1', function() {

        beforeEach(function() {
            module('app1');

            // get the $httpBackend from E2E tests (because the one for unit tests sucks)
            module('ngMockE2E');
            module(function($provide) {
                //retrieve the $httpBackend from module ng and override $delegate from ngMockE2E
                angular.injector(['ng'])
                    .invoke(function($httpBackend) {
                        $provide.value('$delegate', $httpBackend);
                    });

                //retrieve the $httpBackend from module ng and override $delegate from ngMockE2E
                angular.injector(['ngMockE2E'])
                    .invoke(['$httpBackend', function(_$httpBackend_) {
                        $httpBackend = _$httpBackend_;
                    }]);

                $provide.value('$httpBackend', $httpBackend);
            });

            // get the services for all tests
            inject(function(_$ocLazyLoad_, _$rootScope_, _$controller_, _$injector_, _$filter_, _$compile_, _$log_) {
                $ocLazyLoad = _$ocLazyLoad_;
                $rootScope = _$rootScope_;
                $controller = _$controller_;
                $injector = _$injector_;
                $filter = _$filter_;
                $compile = _$compile_;
                $log = _$log_;
            });

            // allow requests for lazy loaded files
            $httpBackend.when('GET', new RegExp(lazyLoadUrl)).passThrough();
        });

        it('service should be defined', function() {
            expect($ocLazyLoad).toBeDefined();
        });

        it('getModules should be working', function() {
            expect($ocLazyLoad.getModules).toBeDefined();
            expect(angular.isArray($ocLazyLoad.getModules())).toBe(true);
        });

        it('loadedModules should be working', function() {
            expect($ocLazyLoad.getModules()).toEqual(['ng', 'oc.lazyLoad']);
        });

        it('angular.bootstrap should add the module to the loaded list', function() {
            angular.bootstrap(document, ['app1']);
            expect($ocLazyLoad.getModules()).toEqual(['ng', 'oc.lazyLoad', 'app1']);
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
            var interval = triggerDigests(),
                templateUrl = lazyLoadUrl + 'test.html',
                testModule = [
                    lazyLoadUrl + 'testModule.js',
                    lazyLoadUrl + 'test.css',
                    templateUrl
                ];

            // create spies for the following tests
            window.spy = jasmine.createSpyObj('spy', ['config', 'run', 'ctrl', 'service', 'filter', 'directive', 'decorator']);

            $ocLazyLoad.load(testModule).then(function success(res) {
                window.clearInterval(interval);

                // Test the module loading
                expect(function() {
                    angular.module('testModule')
                }).not.toThrow();
                expect(angular.module('testModule')).toBeDefined();

                // execute controller
                expect(function() {
                    $controller('TestCtrl', {$scope: $rootScope.$new()});
                }).not.toThrow();

                // instantiate service
                expect(function() {
                    $injector.get('testService');
                }).not.toThrow();

                // execute filter
                expect(function() {
                    $filter('testFilter');
                }).not.toThrow();

                // Compile a piece of HTML containing the directive
                element = $compile("<test></test>")($rootScope.$new());

                // Test the template loading
                var $templateCache;
                expect(function() {
                    $templateCache = $injector.get('$templateCache');
                }).not.toThrow();
                expect($templateCache.get('/partials/test.html')).toEqual('Test partial content');

                // Test the css loading
                var links = document.getElementsByTagName('link');
                expect(links.length).toBeGreaterThan(0);
                expect(function() {
                    links[links.length - 1].sheet.cssRules;
                }).not.toThrow(); // this only works if a stylesheet has been loaded
                expect(links[links.length - 1].sheet.cssRules).toBeDefined();

                // because debug is set to false, we shouldn't have any log
                $log.assertEmpty();

                done();
            }, function error(err) {
                window.clearInterval(interval);
                throw err;
            });
        });

        it('should be able to execute config blocks', function() {
            expect(window.spy.config).toHaveBeenCalledWith('config1');
            expect(window.spy.config).toHaveBeenCalledWith('config2');
            expect(window.spy.config.calls.count()).toEqual(2);
        });

        it('should be able to execute run blocks', function() {
            expect(window.spy.run).toHaveBeenCalledWith('run1');
            expect(window.spy.run).toHaveBeenCalledWith('run2');
            expect(window.spy.run.calls.count()).toEqual(2);
        });

        it('should be able to define controllers', function() {
            expect(window.spy.ctrl).toHaveBeenCalledWith('ctrl');
            expect(window.spy.ctrl.calls.count()).toEqual(1);
        });

        it('should be able to define services', function() {
            expect(window.spy.service).toHaveBeenCalledWith('service');
            expect(window.spy.service.calls.count()).toEqual(1);
        });

        it('should be able to define filters', function() {
            expect(window.spy.filter).toHaveBeenCalledWith('filter');
            expect(window.spy.filter.calls.count()).toEqual(1);
        });

        it('should be able to define directives', function() {
            expect(window.spy.directive).toHaveBeenCalledWith('directive');
            expect(window.spy.directive.calls.count()).toEqual(1);
            expect(element.html()).toContain("Test template");
        });

        if(angular.version.minor > 3) { // only in angular 1.4+
            it('should be able to define decorators', function() {
                expect(window.spy.decorator).toHaveBeenCalledWith('decorator');
                expect(window.spy.service.calls.count()).toEqual(1);
            });
        }

        it('should be able to resolve a file name with url parameters', function(done) {
            var interval = triggerDigests(),
                testModule = [
                    lazyLoadUrl + 'test.html?v=xy12'
                ];

            $ocLazyLoad.load(testModule).then(function success(res) {
                window.clearInterval(interval);

                var $templateCache = $injector.get('$templateCache');
                expect($templateCache.get('/partials/test.html')).toEqual('Test partial content');

                // because debug is set to false, we shouldn't have any log
                $log.assertEmpty();

                done();
            }, function error(err) {
                window.clearInterval(interval);
                throw err;
            });
        });

        it('should be able to lazy load a module when specifying a file type', function(done) {
            var interval = triggerDigests(),
                testModuleNoExt = [
                    {type: 'js', path: lazyLoadUrl + 'testModule.fakejs'},
                    lazyLoadUrl + 'test.css',
                    'html!' + lazyLoadUrl + 'test.html'
                ];

            $ocLazyLoad.load(testModuleNoExt).then(function success(res) {
                window.clearInterval(interval);

                // Test the module loading
                expect(angular.module('testModuleNoExt')).toBeDefined();

                // execute controller
                $controller('TestCtrlNoExt', {$scope: $rootScope.$new()});

                // instantiate service
                $injector.get('testServiceNoExt');

                // execute filter
                $filter('testFilterNoExt');

                // Compile a piece of HTML containing the directive
                element = $compile("<test-no-ext></test-no-ext>")($rootScope.$new());

                // Test the template loading
                var $templateCache = $injector.get('$templateCache');
                expect($templateCache.get('/partials/test.html')).toEqual('Test partial content');

                // Test the css loading
                var links = document.getElementsByTagName('link');
                expect(links.length).toBeGreaterThan(0);
                expect(function() {
                    links[links.length - 1].sheet.cssRules;
                }).not.toThrow(); // this only works if a stylesheet has been loaded
                expect(links[links.length - 1].sheet.cssRules).toBeDefined();

                // because debug is set to false, we shouldn't have any log
                $log.assertEmpty();

                done();
            }, function error(err) {
                window.clearInterval(interval);
                throw err;
            });
        });

        it('should be able to lazy load a module when the url ends with a hash', function(done) {
            var interval = triggerDigests();

            $ocLazyLoad.load(lazyLoadUrl + 'testModule4.js#hash').then(function success(res) {
                window.clearInterval(interval);

                // Test the module loading
                expect(angular.module('testModule4')).toBeDefined();

                // Test the module loading
                expect(res).toBeDefined();

                // because debug is set to false, we shouldn't have any log
                $log.assertEmpty();

                done();
            }, function error(err) {
                window.clearInterval(interval);
                throw err;
            });
        });

        it('should reject the promise when the jsLoader is unable to load a file', function(done) {
            var interval = triggerDigests();

            $ocLazyLoad.load(lazyLoadUrl + 'noFile.js').then(function success(res) {
                window.clearInterval(interval);
                throw(new Error('failed!'));
            }, function error(err) {
                expect(err.message).toEqual('Unable to load ' + lazyLoadUrl + 'noFile.js');
                window.clearInterval(interval);
                done();
            });
        });

        // test 17
        it('should reject the promise when the cssLoader is unable to load a file', function(done) {
            var interval = triggerDigests();

            $ocLazyLoad.load(lazyLoadUrl + 'noFile.css').then(function success(res) {
                window.clearInterval(interval);
                throw(new Error('failed!'));
            }, function error(err) {
                expect(err.message).toEqual('Unable to load ' + lazyLoadUrl + 'noFile.css');
                window.clearInterval(interval);
                done();
            });
        });

        it('should reject the promise when the templateLoader is unable to load a file', function(done) {
            var interval = triggerDigests();

            $ocLazyLoad.load(lazyLoadUrl + 'noFile.html').then(function success(res) {
                window.clearInterval(interval);
                throw(new Error('failed!'));
            }, function error(err) {
                expect(err.message).toEqual('Unable to load template file "' + lazyLoadUrl + 'noFile.html": NOT FOUND');
                window.clearInterval(interval);
                done();
            });
        });

        it('should throw if you try to load a module with missing dependencies', function(done) {
            var interval = triggerDigests();

            $ocLazyLoad.load([lazyLoadUrl + 'testModule3.js']).then(function success(res) {
                window.clearInterval(interval);
                throw(new Error('failed!'));
            }, function error(err) {
                expect(err).toBeDefined();
                window.clearInterval(interval);
                done();
            });
        });

        it('should be able to load a module with dependencies', function(done) {
            var interval = triggerDigests();

            $ocLazyLoad.load([lazyLoadUrl + 'testModule2.js', lazyLoadUrl + 'testModule3.js']).then(function success(res) {
                expect(function() {
                    angular.module('testModule2');
                    angular.module('testModule3');
                }).not.toThrow();
                window.clearInterval(interval);
                done();
            }, function error(err) {
                window.clearInterval(interval);
                throw err;
            });
        });

        it('should be able to load a module with params', function(done) {
            var interval = triggerDigests();

            $ocLazyLoad.load({files: [lazyLoadUrl + 'testModule2.js'], cache: false}).then(function success(res) {
                expect(function() {
                    angular.module('testModule2');
                }).not.toThrow();
                window.clearInterval(interval);
                done();
            }, function error(err) {
                window.clearInterval(interval);
                throw err;
            });
        });

        it('should be able to load a component defined as an object', function(done) {
            var interval = triggerDigests();

            $ocLazyLoad.load(lazyLoadUrl + 'testModule5.js').then(function success(res) {
                expect(function() {
                    angular.module('testModule5');
                }).not.toThrow();

                // execute controller
                expect(function() {
                    $controller('testModule5Ctrl', {$scope: $rootScope.$new()});
                }).not.toThrow();

                window.clearInterval(interval);
                done();
            }, function error(err) {
                window.clearInterval(interval);
                throw err;
            });
        });

        it('should be able to load a module with insertBefore', function(done) {
            var interval = triggerDigests();

            $ocLazyLoad.load({files: [lazyLoadUrl + 'testModule6.js'], insertBefore: "title"}).then(function success(res) {
                expect(function() {
                    angular.module('testModule6');
                }).not.toThrow();
                window.clearInterval(interval);
                done();
            }, function error(err) {
                window.clearInterval(interval);
                throw err;
            });
        });

        it('should be able to load files with the param serie set to true', function(done) {
            var interval = triggerDigests(),
                params = {files: [lazyLoadUrl + 'testModule5.js', lazyLoadUrl + 'testModule6.js'], serie: true};

            $ocLazyLoad.load(params).then(function success(res) {
                expect(function() {
                    angular.module('testModule5');
                    angular.module('testModule6');
                }).not.toThrow();

               expect(params.files.length).toEqual(2); // it should not change the original params

                window.clearInterval(interval);
                done();
            }, function error(err) {
                window.clearInterval(interval);
                throw err;
            });
        });
    });
});
