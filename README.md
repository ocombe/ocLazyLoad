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

- Load on demand using the service or the directive :

```javascript
$ocLazyLoad.load({
	name: 'TestModule',
	files: ['testModule.js']
}).then(function() {
	console.log('done');
});
```

```html
<div oc-lazy-load="{name: 'TestModule', files: ['js/testModule.js'], template: 'partials/testLazyLoad.html'}"></div>
```

See the example in the 'example' folder to know how to integrate ocLazyLoad with your router.