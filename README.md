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

- Load dependencies by placing a module definition in the dependency injection block of your module
```javascript
angular.module('MyModule', [
    {
        name: 'TestModule',
        files: ['/components/TestModule/TestModule.js']
    },{
        name: 'Login',
        files: [
            '/components/Login/Login.js',
            '/components/Login/LoginSocial.js'
        ]
)
```


See the example in the 'example' folder to know how to integrate ocLazyLoad with your router.