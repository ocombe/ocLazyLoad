<a name="0.3.8"></a>
# 0.3.8 (2014-09-25)


## Bug Fixes

- reject on load error
 ([d83f52b5](https://github.com/ocombe/ocLazyLoad/commit/d83f52b56a77a5cdb230260c497ee2db7283e077),
 [#66](https://github.com/ocombe/ocLazyLoad/issues/66))


<a name="0.3.7"></a>
# 0.3.7 (2014-09-10)


## Bug Fixes

- don't reload a dependency that was just loaded
 ([6752bb94](https://github.com/ocombe/ocLazyLoad/commit/6752bb948093f196311572530d814231dc2dcd3a),
 [#64](https://github.com/ocombe/ocLazyLoad/issues/64))


## Features

- new event ocLazyLoad.moduleReloaded
 ([5010d144](https://github.com/ocombe/ocLazyLoad/commit/5010d144d1b250424be2bcfa98faf50c6782bf96))


<a name="0.3.6"></a>
# 0.3.6 (2014-09-02)


## Bug Fixes

- concurrency lazy loads (thanks @BenBlazely)
 ([4899ea1a](https://github.com/ocombe/ocLazyLoad/commit/4899ea1a09bee145f70aec3dd964f885060422d8),
 [#44](https://github.com/ocombe/ocLazyLoad/issues/44))


## Documentation

- added a few links to other examples


<a name="0.3.5"></a>
# 0.3.5 (2014-08-26)


## Bug Fixes

- fixed cases where the config block would not be called
 ([1e29c9d4](https://github.com/ocombe/ocLazyLoad/commit/1e29c9d438d494cd053cd7533921e02e3fe5e5d0),
 [#5](https://github.com/ocombe/ocLazyLoad/issues/5)).
 The config block would not be called if:
  - defined multiple times (only the first 1 would be invoked)
  - defined with an auto injected module: ['...', function() {}]
  - defined after another component: angular.module().controler().config()


<a name="0.3.4"></a>
# 0.3.4 (2014-08-26)


## Bug Fixes

- make sure reconfig:true always run all invoke blocks
 ([361ae6b7](https://github.com/ocombe/ocLazyLoad/commit/361ae6b7d319cb5ada1ab022a6761d4a67a31b58),
 [#54](https://github.com/ocombe/ocLazyLoad/issues/54))
- the config/run blocks were not invoked without reconfig: true
 ([300882a0](https://github.com/ocombe/ocLazyLoad/commit/300882a016e4f9d538e322be9718f21740048296),
 [#5](https://github.com/ocombe/ocLazyLoad/issues/5))
- indexOf polyfill for IE8
 ([5f71c09c](https://github.com/ocombe/ocLazyLoad/commit/5f71c09cad4255932e84c760b07d16a4a2b016d9),
 [#52](https://github.com/ocombe/ocLazyLoad/issues/52))


## Features

- more log messages for debug
 ([bcbca814](https://github.com/ocombe/ocLazyLoad/commit/bcbca814049863b4dd7a6c5c1071efd760094966))


<a name="0.3.3"></a>
# 0.3.3 (2014-07-23)


## Bug Fixes

- don't execute config blocks multiple times by default
 ([e2fec59e](https://github.com/ocombe/ocLazyLoad/commit/e2fec59ee7ff1e95e7e78ef8397c4fe500d8e7c0),
 [#43](https://github.com/ocombe/ocLazyLoad/issues/43), [#41](https://github.com/ocombe/ocLazyLoad/issues/41))
- don't test for .js in path because of requirejs
 ([6045214b](https://github.com/ocombe/ocLazyLoad/commit/6045214b6a4cc2d9dee1c1f2f89946687d963828))
- test order
 ([8412cb43](https://github.com/ocombe/ocLazyLoad/commit/8412cb431bfc742f2c4151e5b089f3313a70035e))


<a name="0.3.2"></a>
# 0.3.2 (2014-07-23)


## Bug Fixes

- allow $ocLazyLoadProvider.config to be called multiple times
 ([c590579c](https://github.com/ocombe/ocLazyLoad/commit/c590579c9512e0dd3fae2c33c0aefc0bb0f7ca7e),
 [#43](https://github.com/ocombe/ocLazyLoad/issues/43))
- prevent duplicate loadings
 ([12bc6b2b](https://github.com/ocombe/ocLazyLoad/commit/12bc6b2b2d1561517d56c14c56c15c332d578344),
 [#35](https://github.com/ocombe/ocLazyLoad/issues/35),
 [#38](https://github.com/ocombe/ocLazyLoad/issues/38))


<a name="0.3.1"></a>
# 0.3.1 (2014-07-14)


## Bug Fixes

- don't reject file load with custom file loaders such as requirejs
 ([91ed522f](https://github.com/ocombe/ocLazyLoad/commit/91ed522f724c3d384146053623bbd1e7c2c86751),
 [#33](https://github.com/ocombe/ocLazyLoad/issues/33))


## Features

- auto changelog from commits msg
 ([c089e085](https://github.com/ocombe/ocLazyLoad/commit/c089e085431d9f1a968e94c78f3c5ac5af71fa72))
- prevent duplicate loadings & add a cache busting param
 ([5a5d7f10](https://github.com/ocombe/ocLazyLoad/commit/5a5d7f108578fe31c5ca1f7c8dfc2d3bccfd1106),
 [#38](https://github.com/ocombe/ocLazyLoad/issues/38))


# 0.3.0 (17 June 2014)

## Features

- $ocLazyLoad will now reject promises on errors
- Use the parameter `debug` to show log messages in the console
- JS / CSS / Template loaders are available by default in $ocLazyLoad but you can overwrite them with the config
- Better doc (finally! \o/)
- Example1 is now much better !
- Events broadcasted on module / component / file load (#21)


# 0.2.0 (20 May 2014)
* Added support for $animateProvider #19
* Added support for CSS Loading (And perhaps other file types in the future) #19
* Added loadAll function for use when a state requires resolve on more than one asset. #19
* FIX: Angular JS 1.3.0-beta.8 changed the way config blocks are handled (now invoked last) #19
* Adopted the MIT license as requested in #20
* Added a gulpfile to build dist files (and, in the future, to do tests before the build). Run `npm install` to install the new dependencies and `npm build` to build the dist files.
* **Breaking change** moved the src files to /src and the dist files to /dist. Installations via bower will only see the dist folder
* Moved the examples to /examples

# 0.1.3 (30 April 2014)
* Fix for bug #18: merged files and incorrect module loading

# 0.1.2 (14 April 2014)
* Fix for bug #16: config blocks didn't work for module dependencies

# 0.1.1 (08 April 2014)
* Fix for bug #8: runBlocks can now load new modules (thanks to @rolandzwaga)
* Added an example that makes use of requirejs and uses ngGrid as a lazy loaded module (thanks to @rolandzwaga)

# 0.1.0 (04 April 2014)
* Added a changelog !
* Added ```loadTemplateFile``` function.
* Merge pull request #6 from BenBlazely/master (Extension of lazy loading to the angular.module DI block, refactored to use promises for tracking progress.)
* Merge pull request #7 from rolandzwaga/master (Added some improvements for apps using angular.boostrap & for duplicated modules)
* Fixed a bug with run blocks not working when they used unloaded modules. Not a complete fix though, more to come when bug #8 is fixed