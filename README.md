ocLazyLoad
==========

Load modules on demand (lazy load) in AngularJS

### Key features
- Dependencies are automatically loaded
- Debugger like (no eval code)
- The ability to mix normal boot and load on demand
- Load via the service or the directive
- Use your own async loader (requireJS, script.js ...)

### Usage
- Put ocLazyLoad.js into you project
- Add the module ```oc.lazyLoad``` to your application
- Configure the service provider ```$loadOnDemandProvider```

```javascript
angular.module('app').config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
	$ocLazyLoadProvider.config({
		asyncLoader: $script // your async loader: $script.js, requireJS...
	});
}]);
```

- When using angular.bootstrap(...) add the main app module in the configuration:
```javascript
angular.module('app').config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
	$ocLazyLoadProvider.config({
		loadedModules: ['main-app-module-name'],
		asyncLoader: $script // your async loader: $script.js, requireJS...
	});
}]);
```

- Load on demand using the service or the directive :

Single Dependency
```javascript
$ocLazyLoad.load({
	name: 'TestModule',
	files: ['testModule.js']
}).then(function() {
	console.log('done');
});
```

Multiple Dependency
```javascript
$ocLazyLoad.load([{
	name: 'TestModule',
	files: ['testModule.js']
},{
    name: 'AnotherModule',
    files: ['anotherModule.js']
}]).then(function() {
	console.log('done');
});
```

```html
<div oc-lazy-load="{name: 'TestModule', files: ['js/testModule.js'], template: 'partials/testLazyLoad.html'}"></div>
```

- Load dependencies by placing a module definition in the dependency injection block of your module
```javascript
angular.module('MyModule', [{
		name: 'TestModule',
		files: ['/components/TestModule/TestModule.js']
	}, {
		name: 'Login',
		files: [
			'/components/Login/Login.js',
			'/components/Login/LoginSocial.js'
		]
	}]
)
```

- Load a template file using ```loadTemplateFile```:
```javascript
$ocLazyLoad.loadTemplateFile('partial.html').then(function() {
	console.log('done');
});
```
You can also load multiple files at the same time, or put multiple template blocks in one file if you prefer.
```javascript
$ocLazyLoad.loadTemplateFile(['partial.html, partial2.html']).then(function() {
	console.log('done');
});
```
You can add a second parameter config if you need to define some configuration for the requests (check: http://docs.angularjs.org/api/ng/service/$http)


See the example in the 'example' folder to know how to integrate ocLazyLoad with your router.