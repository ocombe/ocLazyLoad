/**
 * original copyright: Andy Grom (https://github.com/AndyGrom/loadOnDemand)
 * rewrite by: Olivier Combe (https://github.com/ocombe/ocLazyLoad)
 */

(function() {
	'use strict';
	var regModules = ['ng'];

	var ocLazyLoad = angular.module('oc.lazyLoad', ['ng']);

	ocLazyLoad.provider('$ocLazyLoad', ['$controllerProvider', '$provide', '$compileProvider', '$filterProvider', '$injector',
	                                    function($controllerProvider, $provide, $compileProvider, $filterProvider, $injector) {

		                                    var modules = {},
			                                    asyncLoader,
			                                    templates = [],
			                                    providers = {
				                                    $controllerProvider: $controllerProvider,
				                                    $compileProvider: $compileProvider,
				                                    $filterProvider: $filterProvider,
				                                    $provide: $provide, // other things
				                                    $injector: $injector
			                                    };

		                                    this.$get = ['$timeout', '$log', '$q', '$templateCache', '$http', '$rootElement', function($timeout, $log, $q, $templateCache, $http, $rootElement) {
												var instanceInjector;
												//Make this lazy because at the moment that $get() is called the instance
												//injector hasn't been assigned to the rootElement yet:
												providers.getInstanceInjector = function() {
													return (instanceInjector) ? instanceInjector : (instanceInjector = $rootElement.data('$injector'));
												}
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

				                                    getModuleName: function (module) {
					                                    var moduleName;
					                                    if (typeof module === 'string') {
						                                    moduleName = module;
					                                    } else if (typeof module === 'object' && module.hasOwnProperty('name') && typeof module.name === 'string') {
						                                    moduleName = module.name;
					                                    } else {
						                                    moduleName = undefined;
					                                    }
					                                    return moduleName;
				                                    },

				                                    loadTemplateFile: function(urls, config) {
					                                    if(angular.isString(urls)) {
						                                    urls = [urls];
					                                    }
					                                    var promisesList = [];
					                                    angular.forEach(urls, function(url) {
						                                    var deferred = $q.defer();
						                                    promisesList.push(deferred.promise);
						                                    if(templates.indexOf(url) === -1 || (angular.isDefined(config) && config.cache === false)) {
							                                    $http.get(url, config).success(function(data) {
								                                    angular.forEach(angular.element(data), function(node) {
									                                    if(node.nodeName === 'SCRIPT' && node.type === 'text/ng-template') {
										                                    $templateCache.put(node.id, node.innerHTML);
									                                    }
								                                    });
								                                    templates.push(url);
								                                    deferred.resolve();
							                                    }).error(function(data) {
								                                    $log.error('Error load template "' + url + '": ' + data);
							                                    });
						                                    } else {
							                                    deferred.resolve();
						                                    }
					                                    });
					                                    return $q.all(promisesList);
				                                    },

				                                    load: function(module) {
					                                    var self = this,
						                                    config = null,
						                                    moduleCache = [],
						                                    deferred = $q.defer(),
						                                    moduleName,
						                                    errText;

					                                    moduleName = self.getModuleName(module);

					                                    // If this module has been loaded before, re-use it.
					                                    if (moduleExists(moduleName)) {
						                                    moduleCache.push(moduleName);
						                                    deferred.resolve();
						                                    return deferred.promise;
					                                    }

					                                    // Get or Set a configuration depending on what was passed in
					                                    if (typeof module === 'string') {
						                                    config = self.getModuleConfig(module);
					                                    } else if (typeof module === 'object') {
						                                    config = self.setModuleConfig(module);
					                                    }

					                                    if (config === null) {
						                                    errText = 'Module "' + moduleName + '" is not configured, cannot load.';
						                                    $log.error(errText);
						                                    throw errText;
					                                    }

					                                    moduleCache.push = function (value) {
						                                    if (this.indexOf(value) === -1) {
							                                    Array.prototype.push.apply(this, arguments);
						                                    }
					                                    };

					                                    function loadDependencies(module) {
						                                    var moduleName,
							                                    loadedModule,
							                                    requires,
							                                    promisesList = [],
							                                    load_complete;

						                                    moduleName = self.getModuleName(module);
						                                    loadedModule = angular.module(moduleName);
						                                    requires = getRequires(loadedModule);

						                                    angular.forEach(requires, function (requireEntry) {
							                                    var config,
								                                    deferredDep;

							                                    // If no configuration is provided, try and find one from a previous load.
							                                    // If there isn't one, bail and let the normal flow run
							                                    if (typeof requireEntry === 'string') {
								                                    config = self.getModuleConfig(requireEntry);
								                                    if (config === null) {
									                                    moduleCache.push(requireEntry); // We don't know about this module, but something else might, so push it anyway.
									                                    return;
								                                    }
								                                    requireEntry = config;
							                                    }

							                                    // Check if this dependency has been loaded previously or is already in the moduleCache
							                                    if (moduleExists(requireEntry.name) || moduleCache.indexOf(requireEntry.name) !== -1) {
								                                    if (typeof module !== 'string') {
									                                    // The dependency exists, but it's being redefined, not inherited by a simple string reference, raise a warning and ignore the new config.
									                                    // TODO: This could be made smarter. There's no checking here yet to determine if the configurations are actually different.
									                                    $log.warn('Module "', moduleName, '" attempted to redefine configuration for dependency "', requireEntry.name, '"\nExisting:', self.getModuleConfig(requireEntry.name), 'Ignored:', requireEntry);
								                                    }
								                                    return;
							                                    } else if (typeof requireEntry === 'object') {
								                                    // The dependency doesn't exist in the module cache and is a new conifguration, so store and push it.
								                                    self.setModuleConfig(requireEntry);
								                                    moduleCache.push(requireEntry.name);
							                                    }

							                                    // Check if the dependency has any files that need to be loaded. If there are, push a new promise to the promise list.
							                                    if (requireEntry.hasOwnProperty('files') && requireEntry.files.length !== 0) {
								                                    deferredDep = $q.defer();
								                                    if (requireEntry.files) {
									                                    promisesList.push(deferredDep.promise);
									                                    asyncLoader(requireEntry.files, function () {
										                                    loadDependencies(requireEntry).then(function () {
											                                    deferredDep.resolve();
										                                    });
									                                    });
								                                    }
							                                    }
						                                    });

						                                    // Create a wrapper promise to watch the promise list and resolve it once everything is done.
						                                    load_complete = $q.defer();
						                                    $q.all(promisesList).then(function () {
							                                    load_complete.resolve();
						                                    });

						                                    return load_complete.promise;
					                                    }

					                                    asyncLoader(config.files, function () {
						                                    moduleCache.push(moduleName);
						                                    loadDependencies(moduleName).then(function () {
							                                    register(providers, moduleCache, $log);
							                                    $timeout(function () {
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

			                                    if(config.loadedModules) {
				                                    var addRegModule = function(loadedModule) {
					                                    if(regModules.indexOf(loadedModule) < 0) {
						                                    regModules.push(loadedModule);
						                                    angular.forEach(angular.module(loadedModule).requires, addRegModule);
					                                    }
				                                    };
				                                    angular.forEach(config.loadedModules, addRegModule);
			                                    }

			                                    if(config.modules) {
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
				                                    var onloadExp = scope.$eval(attr.ocLazyLoad).onload || '';

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
					                                    var view;

					                                    if(typeof(view = $templateCache.get(url)) !== 'undefined') {
						                                    callback(view);
					                                    } else {
						                                    $http.get(url)
							                                    .success(function(data) {
								                                    $templateCache.put('view:' + url, data);
								                                    callback(data);
							                                    })
							                                    .error(function(data) {
								                                    $log.error('Error load template "' + url + '": ' + data);
							                                    });
					                                    }
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
								                                    linkFn(childScope);
								                                    childScope.$emit('$includeContentLoaded');
								                                    childScope.$eval(onloadExp);
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
		if(registerModules) {
			var i, ii, k, invokeQueue, moduleName, moduleFn, invokeArgs, provider, runBlocks = [];
			for(k = registerModules.length - 1; k >= 0; k--) {
				moduleName = registerModules[k];
				if (typeof moduleName !== 'string') {
					moduleName = getModuleName(moduleName);
				}
				if ((!moduleName) || (regModules.indexOf(moduleName) > -1)) {
					continue;
				}
				regModules.push(moduleName);
				moduleFn = angular.module(moduleName);
				runBlocks = runBlocks.concat(moduleFn._runBlocks);
				try {
					for(invokeQueue = moduleFn._invokeQueue, i = 0, ii = invokeQueue.length; i < ii; i++) {
						invokeArgs = invokeQueue[i];
						if (angular.isArray(invokeArgs)) {
							if(providers.hasOwnProperty(invokeArgs[0])) {
								provider = providers[invokeArgs[0]];
							} else {
								return $log.error('unsupported provider ' + invokeArgs[0]);
							}
							provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
						}
					}
				} catch(e) {
					if(e.message) {
						e.message += ' from ' + moduleName;
					}
					$log.error(e.message);
					throw e;
				}
				register(providers, moduleFn.requires, $log);
				registerModules.pop();
			}
			var instanceInjector = providers.getInstanceInjector();
			angular.forEach(runBlocks, function(fn) {
				try {
					instanceInjector.invoke(fn);
				} catch(e) {
					if(e.message) {
						e.message += ' from ' + moduleName;
					}
					$log.error(e.message);
				}
			});
		}
		return null;
	}

	function getModuleName(dependencyObject) {
		return (dependencyObject.name) ? dependencyObject.name : null;
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
