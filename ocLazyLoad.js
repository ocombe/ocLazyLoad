/**
 * original copyright: Andy Grom (https://github.com/AndyGrom/loadOnDemand)
 * rewrite by: Olivier Combe (https://github.com/ocombe/ocLazyLoad)
 */

(function() {
	'use strict';
	var regModules = ['ng', 'ngAnimate'];

	var ocLazyLoad = angular.module('oc.lazyLoad', ['ng']);

	ocLazyLoad.provider('$ocLazyLoad', ['$controllerProvider', '$provide', '$compileProvider', '$filterProvider', '$injector',
		function($controllerProvider, $provide, $compileProvider, $filterProvider, $injector) {

			var modules = {},
				asyncLoader,
				providers = {
					$controllerProvider: $controllerProvider,
					$compileProvider: $compileProvider,
					$filterProvider: $filterProvider,
					$provide: $provide, // other things
					$injector: $injector
				};

			this.$get = ['$timeout', '$log', '$q', function($timeout, $log, $q) {
				return {
					getModuleConfig: function(name) {
						if(!modules[name]) {
							return null;
						}
						return modules[name];
					},

					setModuleConfig: function(module) {
						modules[module.name] = module;
						return module;
					},

					getModules: function() {
						return regModules;
					},

					load: function(name) {
						var self = this,
							config,
							moduleCache = [],
							deferred = $q.defer();

						if(typeof name === 'string') {
							config = self.getModuleConfig(name);
						} else if(typeof name === 'object' && typeof name.name !== 'undefined') {
							config = self.setModuleConfig(name);
							name = name.name;
						}

						moduleCache.push = function(value) {
							if(this.indexOf(value) === -1) {
								Array.prototype.push.apply(this, arguments);
							}
						};

						if(!config) {
							var errorText = 'Module "' + name + '" not configured';
							$log.error(errorText);
							throw errorText;
						}

						function loadDependencies(moduleName, allDependencyLoad) {
							if(regModules.indexOf(moduleName) > -1) {
								return allDependencyLoad();
							}

							var loadedModule = angular.module(moduleName),
								requires = getRequires(loadedModule);

							function onModuleLoad(moduleLoaded) {
								if(moduleLoaded) {

									var index = requires.indexOf(moduleLoaded);
									if(index > -1) {
										requires.splice(index, 1);
									}
								}
								if(requires.length === 0) {
									$timeout(function() {
										allDependencyLoad(moduleName);
									});
								}
							}

							var requireNeeded = getRequires(loadedModule);
							angular.forEach(requireNeeded, function(requireModule) {
								moduleCache.push(requireModule);

								if(moduleExists(requireModule)) {
									return onModuleLoad(requireModule);
								}

								var requireModuleConfig = self.getConfig(requireModule);
								if(requireModuleConfig && (typeof requireModuleConfig.files !== 'undefined')) {
									asyncLoader(requireModuleConfig.files, function() {
										loadDependencies(requireModule, function requireModuleLoaded(name) {
											onModuleLoad(name);
										});
									});
								} else {
									$log.warn('module "' + requireModule + "' not loaded and not configured");
									onModuleLoad(requireModule);
								}
								return null;
							});

							if(requireNeeded.length === 0) {
								onModuleLoad();
							}
							return null;
						}

						asyncLoader(config.files, function() {
							moduleCache.push(name);
							loadDependencies(name, function() {
								register(providers, moduleCache, $log);
								$timeout(function() {
									deferred.resolve(config);
								});
							});
						});
						return deferred.promise;
					}
				};
			}];

			this.config = function(config) {
				if(typeof config.asyncLoader === 'undefined') {
					throw('You need to define an async loader such as requireJS or script.js');
				}

				asyncLoader = config.asyncLoader;
				init(angular.element(window.document));

				if(typeof config.modules !== 'undefined') {
					if(angular.isArray(config.modules)) {
						angular.forEach(config.modules, function(moduleConfig) {
							modules[moduleConfig.name] = moduleConfig;
						});
					} else {
						modules[config.modules.name] = config.modules;
					}
				}
			};
		}]);

	ocLazyLoad.directive('ocLazyLoad', ['$http', '$log', '$ocLazyLoad', '$compile', '$timeout', '$templateCache',
		function($http, $log, $ocLazyLoad, $compile, $timeout, $templateCache) {
			return {
				link: function(scope, element, attr) {
					var childScope;

					/**
					 * Destroy the current scope of this element and empty the html
					 */
					function clearContent() {
						if(childScope) {
							childScope.$destroy();
							childScope = null;
						}
						element.html('');
					}

					/**
					 * Load a template from cache or url
					 * @param url
					 * @param callback
					 */
					function loadTemplate(url, callback) {
						scope.$apply(function() {
							var view;

							if(typeof(view = $templateCache.get(url)) !== 'undefined') {
								scope.$evalAsync(function() {
									callback(view);
								});
							} else {
								$http.get(url)
									.success(function(data) {
										$templateCache.put('view:' + url, data);
										scope.$evalAsync(function() {
											callback(data);
										});
									})
									.error(function(data) {
										$log.error('Error load template "' + url + "': " + data);
									});
							}
						});
					}

					scope.$watch(attr.ocLazyLoad, function(moduleName) {
						if(moduleName) {
							$ocLazyLoad.load(moduleName).then(function(moduleConfig) {
								if(!moduleConfig.template) {
									return;
								}
								loadTemplate(moduleConfig.template, function(template) {
									childScope = scope.$new();
									element.html(template);

									var content = element.contents();
									var linkFn = $compile(content);
									$timeout(function() {
										linkFn(childScope);
									});
								});
							});
						} else {
							clearContent();
						}
					});
				}
			};
		}]);

	/**
	 * Get the list of required modules/services/... for this module
	 * @param module
	 * @returns {Array}
	 */
	function getRequires(module) {
		var requires = [];
		angular.forEach(module.requires, function(requireModule) {
			if(regModules.indexOf(requireModule) === -1) {
				requires.push(requireModule);
			}
		});
		return requires;
	}

	/**
	 * Check if a module exists
	 * @param moduleName
	 * @returns {boolean}
	 */
	function moduleExists(moduleName) {
		try {
			angular.module(moduleName);
		} catch(e) {
			if(/No module/.test(e) || (e.message.indexOf('$injector:nomod') > -1)) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Register a new module and load it
	 * @param providers
	 * @param registerModules
	 * @param $log
	 * @returns {*}
	 */
	function register(providers, registerModules, $log) {
		var i, ii, k, invokeQueue, moduleName, moduleFn, invokeArgs, provider;
		if(registerModules) {
			var runBlocks = [];
			for(k = registerModules.length - 1; k >= 0; k--) {
				moduleName = registerModules[k];
				regModules.push(moduleName);
				moduleFn = angular.module(moduleName);
				runBlocks = runBlocks.concat(moduleFn._runBlocks);
				try {
					for(invokeQueue = moduleFn._invokeQueue, i = 0, ii = invokeQueue.length; i < ii; i++) {
						invokeArgs = invokeQueue[i];

						if(providers.hasOwnProperty(invokeArgs[0])) {
							provider = providers[invokeArgs[0]];
						} else {
							return $log.error("unsupported provider " + invokeArgs[0]);
						}
						provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
					}
				} catch(e) {
					if(e.message) {
						e.message += ' from ' + moduleName;
					}
					$log.error(e.message);
					throw e;
				}
				registerModules.pop();
			}
			angular.forEach(runBlocks, function(fn) {
				providers.$injector.invoke(fn);
			});
		}
		return null;
	}

	/**
	 * Get the list of existing registered modules
	 * @param element
	 */
	function init(element) {
		var elements = [element],
			appElement,
			module,
			names = ['ng:app', 'ng-app', 'x-ng-app', 'data-ng-app'],
			NG_APP_CLASS_REGEXP = /\sng[:\-]app(:\s*([\w\d_]+);?)?\s/;

		function append(elm) {
			return (elm && elements.push(elm));
		}

		angular.forEach(names, function(name) {
			names[name] = true;
			append(document.getElementById(name));
			name = name.replace(':', '\\:');
			if(element.querySelectorAll) {
				angular.forEach(element.querySelectorAll('.' + name), append);
				angular.forEach(element.querySelectorAll('.' + name + '\\:'), append);
				angular.forEach(element.querySelectorAll('[' + name + ']'), append);
			}
		});

		angular.forEach(elements, function(elm) {
			if(!appElement) {
				var className = ' ' + element.className + ' ';
				var match = NG_APP_CLASS_REGEXP.exec(className);
				if(match) {
					appElement = elm;
					module = (match[2] || '').replace(/\s+/g, ',');
				} else {
					angular.forEach(elm.attributes, function(attr) {
						if(!appElement && names[attr.name]) {
							appElement = elm;
							module = attr.value;
						}
					});
				}
			}
		});

		if(appElement) {
			(function addReg(module) {
				if(regModules.indexOf(module) === -1) {
					regModules.push(module);
					var mainModule = angular.module(module);
					angular.forEach(mainModule.requires, addReg);
				}
			})(module);
		}
	}
})();
