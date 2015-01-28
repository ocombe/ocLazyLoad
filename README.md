ocLazyLoad [![Build Status](https://travis-ci.org/ocombe/ocLazyLoad.svg)](https://travis-ci.org/ocombe/ocLazyLoad)
==========

Load modules on demand (lazy load) in AngularJS

## Key features
- Dependencies are automatically loaded
- Debugger friendly (no eval code)
- The ability to mix normal boot and load on demand
- Load via the service or the directive
- Use the embedded async loader or use your own (requireJS, ...)
- Load js (angular or not) / css / templates files
- Compatible with AngularJS 1.2.x and 1.3.x

## Usage
- Put ocLazyLoad.js into you project

- Add the module ```oc.lazyLoad``` to your application (you can install it with `bower install oclazyload` or `npm install oclazyload`)

- Load on demand:
With $ocLazyLoad you can load angular modules, but if you want to load controllers / services / filters / ... without defining a new module it's entirely possible, just use the name an existing module (your app name for example).
There are multiple ways to use `$ocLazyLoad` to load your files, just choose the one that fits you the best.

###### More examples / tutorials / articles
You can find three basic examples in the example folder. If you need more, check out these links:
- Lazy loading with requirejs, ocLazyLoad and ui-router: [using the templateProvider](http://plnkr.co/edit/OGvi01?p=preview) / [using the uiRouterDecorator](http://plnkr.co/edit/6CLDsz?p=preview) - by @gilbox
- Lazy Loading ui-router states with requirejs, ocLazyLoad and ui-router-extras futureStates, [part 1](http://bardo.io/posts/oclazyload-future-states/) / [part 2](http://bardo.io/posts/ng-deferred-bootstrap-like-with-oclazyload/) - by @kbdaitch
- Lazy loading Angular modules with ocLazyLoad, [part 1](https://egghead.io/lessons/angularjs-lazy-loading-angular-modules-with-oclazyload) / [part 2](https://egghead.io/lessons/angularjs-lazy-loading-modules-with-ui-router-and-oclazyload) / [part 3](https://egghead.io/lessons/angularjs-simple-lazy-loaded-angular-module-syntax-with-oclazyload) / [part 4](https://egghead.io/lessons/angularjs-lazy-loading-non-angular-libraries-with-oclazyload) - An AngularJS lesson by [@johnlindquist](https://twitter.com/johnlindquist) on [egghead.io](https://egghead.io/)

### Service
You can include `$ocLazyLoad` and use the function `load` which returns a promise. It supports a single dependency (object) or multiple dependencies (array of objects).

Load a single module with one file:
```js
$ocLazyLoad.load({
	name: 'TestModule',
	files: ['testModule.js']
});
```

Load a single module with multiple files:
```js
$ocLazyLoad.load({
	name: 'TestModule',
	files: ['testModule.js', 'testModuleCtrl.js', 'testModuleService.js']
});
```

Load a single module with multiple files and specify a type where necessary:
Note: When using the requireJS style formatting, do not specify a file extension. Use one or the other.
```js
$ocLazyLoad.load({
	name: 'TestModule',
	files: [
	    'testModule.js',
	    {type: 'css', path: 'testModuleCtrl'},
	    {type: 'html', path: 'testModuleCtrl.html'},
	    {type: 'js', path: 'testModuleCtrl'},
	    'js!testModuleService',
	    'less!testModuleLessFile'
	]
});
```

Load multiple modules with one or more files:
```js
$ocLazyLoad.load([{
	name: 'TestModule',
	files: ['testModule.js', 'testModuleCtrl.js', 'testModuleService.js']
},{
    name: 'AnotherModule',
    files: ['anotherModule.js']
}]);
```

You can also load external libs (not angular):
```js
$ocLazyLoad.load([{
	name: 'TestModule',
	files: ['testModule.js', 'bower_components/bootstrap/dist/js/bootstrap.js']
},{
    name: 'AnotherModule',
    files: ['anotherModule.js']
}]);
```

If you don't load angular files at all, you don't need to define the module name:
```js
$ocLazyLoad.load([{
	files: ['bower_components/bootstrap/dist/js/bootstrap.js']
}]);
```

In fact, if you don't load an angular module, why bother with an object having a single `files` property? You can just pass the urls.
Single file:
```js
$ocLazyLoad.load('bower_components/bootstrap/dist/js/bootstrap.js');
```

You can also load css and template files:
```js
$ocLazyLoad.load([
	'bower_components/bootstrap/dist/js/bootstrap.js',
	'bower_components/bootstrap/dist/css/bootstrap.css',
	'partials/template1.html'
]);
```

If you want to load templates, the template file should be an html (or htm) file with regular [script templates](https://docs.angularjs.org/api/ng/directive/script). It looks like this:
```html
<script type="text/ng-template" id="/tpl.html">
  Content of the template.
</script>
```

You can put more than one template script in your template file, just make sure to use different ids:
```html
<script type="text/ng-template" id="/tpl1.html">
  Content of the first template.
</script>

<script type="text/ng-template" id="/tpl2.html">
  Content of the second template.
</script>
```

There are two ways to define config options for the load function. You can use a second optional parameter that will define configs for all the modules that you will load, or you can define optional parameters to each module.
For example, these are equivalent:
```js
$ocLazyLoad.load([{
	name: 'TestModule',
	files: ['testModule.js', 'bower_components/bootstrap/dist/js/bootstrap.js'],
	cache: false
},{
    name: 'AnotherModule',
    files: ['anotherModule.js'],
    cache: false
}]);
```
And
```js
$ocLazyLoad.load([{
	name: 'TestModule',
	files: ['testModule.js', 'bower_components/bootstrap/dist/js/bootstrap.js']
},{
    name: 'AnotherModule',
    files: ['anotherModule.js']
}],
{cache: false});
```

If you load a template with the native template loader, you can use any parameter from the $http service (check: https://docs.angularjs.org/api/ng/service/$http#usage).
```js
$ocLazyLoad.load(
	['partials/template1.html', 'partials/template2.html'],
	{cache: false, timeout: 5000}
);
```

The existing parameters that you can use are `cache`, `reconfig`, `rerun`, `serie` and `insertBefore`.
The parameter `cache: false` works for all native loaders (**all requests are cached by default**):

```js
$ocLazyLoad.load({
	name: 'TestModule',
	cache: false,
	files: ['testModule.js', 'bower_components/bootstrap/dist/js/bootstrap.js']
});
```

By default, if you reload a module, the config block won't be invoked again (because often it will lead to unexpected results). But if you really need to execute the config function again, use the parameter `reconfig: true`:
```js
$ocLazyLoad.load({
	name: 'TestModule',
	reconfig: true,
	files: ['testModule.js', 'bower_components/bootstrap/dist/js/bootstrap.js']
});
```

The same problem might happen with run blocks, use `rerun: true` to rerun the run blocks:
```js
$ocLazyLoad.load({
	name: 'TestModule',
	rerun: true,
	files: ['testModule.js', 'bower_components/bootstrap/dist/js/bootstrap.js']
});
```

By default the native loaders will load your files in parallel. If you need to load your files in serie, you can use `serie: true`:
```js
$ocLazyLoad.load({
	name: 'mgcrea.ngStrap',
	serie: true,
	files: [
		'bower_components/angular-strap/dist/angular-strap.js',
		'bower_components/angular-strap/dist/angular-strap.tpl.js'
	]
});
```

The files, by default, will be inserted before the last child of the `head` element. You can override this by using `insertBefore: 'cssSelector'`:
```js
$ocLazyLoad.load({
	name: 'TestModule',
	insertBefore: '#load_css_before',
	files: ['bower_components/bootstrap/dist/css/bootstrap.css']
});
```

### Directive
The directive usage is very similar to the service. The main interest here is that the content will be included and compiled once your modules have been loaded.
This means that you can use directives that will be lazy loaded inside the oc-lazy-load directive.

Use the same parameters as a service:
```html
<div oc-lazy-load="{name: 'TestModule', files: ['js/testModule.js', 'partials/lazyLoadTemplate.html']}">
	// Use a directive from TestModule
	<test-directive></test-directive>
</div>
```

You can use variables to store parameters:
```js
$scope.lazyLoadParams = {
	name: 'TestModule',
	files: [
		'js/testModule.js',
		'partials/lazyLoadTemplate.html'
	]
};
```
```html
<div oc-lazy-load="lazyLoadParams"></div>
```

### Bonus: Use dependency injection
As a convenience you can also load dependencies by placing a module definition in the dependency injection block of your module. This will only work for lazy loaded modules:
```js
angular.module('MyModule', ['pascalprecht.translate', {
		name: 'TestModule',
		files: ['/components/TestModule/TestModule.js']
	}, {
		files: [
			'/components/bootstrap/css/bootstrap.css',
			'/components/bootstrap/js/bootstrap.js'
		]
	}]
);
```


## Configuration
You can configure the service provider ```$ocLazyLoadProvider``` in the config function of your application:

```js
angular.module('app').config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
	$ocLazyLoadProvider.config({
		...
	});
}]);
```

The options are:
- `jsLoader`: You can use your own async loader. The one provided with $ocLazyLoad is based on $script.js, but you can use requireJS or any other async loader that works with the following syntax:
	```js
	$ocLazyLoadProvider.config({
		jsLoader: function([Array of files], callback, params);
	});
	```

- `cssLoader`: You can also define your own css async loader. The rules and syntax are the same as jsLoader.
	```js
	$ocLazyLoadProvider.config({
		cssLoader: function([Array of files], callback, params);
	});
	```

- `templatesLoader`: You can use your template loader. It's similar to the `jsLoader` but it uses an optional config parameter
	```js
	$ocLazyLoadProvider.config({
		templatesLoader: function([Array of files], callback, params);
	});
	```

- `debug`: $ocLazyLoad returns a promise that can be rejected if there is an error. If you set debug to true, $ocLazyLoad will also log all errors to the console.
	```js
	$ocLazyLoadProvider.config({
		debug: true
	});
	```

- `events`: $ocLazyLoad can broadcast an event when you load a module, a component and a file (js/css/template). It is disabled by default, set events to true to activate it. The events are `ocLazyLoad.moduleLoaded`, `ocLazyLoad.moduleReloaded`, `ocLazyLoad.componentLoaded`, `ocLazyLoad.fileLoaded`.
	```js
	$ocLazyLoadProvider.config({
		events: true
	});
	```
	```js
	$scope.$on('ocLazyLoad.moduleLoaded', function(e, module) {
		console.log('module loaded', module);
	});
	```

- `modules`: predefine the configuration of your modules for a later use
	```js
	$ocLazyLoadProvider.config({
	    modules: [{
	        name: 'TestModule',
	        files: ['js/TestModule.js']
	    }]
	});
	```
	```js
	$ocLazyLoad.load('TestModule');
	```


## Works well with your router
`$ocLazyLoad` works well with routers and especially [ui-router](https://github.com/angular-ui/ui-router). Since it returns a promise, use the [resolve property](https://github.com/angular-ui/ui-router/wiki#resolve) to make sure that your components are loaded before the view is resolved:
```js
$stateProvider.state('index', {
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
             return $ocLazyLoad.load({
                name: 'app',
                files: ['js/AppCtrl.js']
             });
		}]
	}
});
```

If you have nested views, make sure to include the resolve from the parent to load your components in the right order:
```js
$stateProvider.state('parent', {
	url: "/",
	resolve: {
		loadMyService: ['$ocLazyLoad', function($ocLazyLoad) {
             return $ocLazyLoad.load({
                name: 'app',
                files: ['js/ServiceTest.js']
             });
		}]
	}
})
.state('parent.child', {
    resolve: {
        test: ['loadMyService', '$ServiceTest', function(loadMyService, $ServiceTest) {
            // you can use your service
            $ServiceTest.doSomething();
        }]
    }
});
```

It also works for sibling resolves:
```js
$stateProvider.state('index', {
	url: "/",
	resolve: {
		loadMyService: ['$ocLazyLoad', function($ocLazyLoad) {
             return $ocLazyLoad.load({
                name: 'app',
                files: ['js/ServiceTest.js']
             });
		}],
        test: ['loadMyService', '$serviceTest', function(loadMyService, $serviceTest) {
            // you can use your service
            $serviceTest.doSomething();
        }]
    }
});
```

Of course, if you want to use the loaded files immediately, you don't need to define two resolves, you can also use the injector (it works anywhere, not just in the router):
```js
$stateProvider.state('index', {
	url: "/",
	resolve: {
		loadMyService: ['$ocLazyLoad', '$injector', function($ocLazyLoad, $injector) {
             return $ocLazyLoad.load({
                name: 'app',
                files: ['js/ServiceTest.js']
             }).then(function() {
                var $serviceTest = $injector.get("$serviceTest");
                $serviceTest.doSomething();
             });
		}]
    }
});
```


##Other functions
`$ocLazyLoad` provides a few other functions that might help you in a few specific cases:

- `setModuleConfig(moduleConfig)`: Lets you define a module config object

- `getModuleConfig(moduleName)`: Lets you get a module config object

- `getModules()`: Returns the list of loaded modules

- `isLoaded(modulesNames)`: Lets you check if a module (or a list of modules) has been loaded into Angular or not


##Contribute
If you want to get started and the docs are not enough, see the examples in the 'examples' folder!

If you want to contribute, it would be really awesome to add some tests, or more examples :)
