<a name="0.5.2"></a>
# 0.5.2 (2014-12-30)


## Bug Fixes

- use init for bootstrapped apps & removed the need for loadedModules
 ([01936cd6](https://github.com/ocombe/ocLazyLoad/commit/01936cd6fe0e0f89a203408ee0bbb927f5b44d07),
 [#84](https://github.com/ocombe/ocLazyLoad/issues/84), [#102](https://github.com/ocombe/ocLazyLoad/issues/102), [#109](https://github.com/ocombe/ocLazyLoad/issues/109))


## Documentation

- added a link to a new lesson from egghead.io
 ([ef8d2871](https://github.com/ocombe/ocLazyLoad/commit/ef8d2871a445b29588f779a27cb3b702d0da6a13))


<a name="0.5.1"></a>
# 0.5.1 (2014-11-20)


## Bug Fixes

- don't use async when you load files in serie
 ([9af93ed3](https://github.com/ocombe/ocLazyLoad/commit/9af93ed30cf05c6c64594d206dc9bf36a318f46e),
 [#95](https://github.com/ocombe/ocLazyLoad/issues/95))
- avoid errors thrown on empty template files
 ([768b9d75](https://github.com/ocombe/ocLazyLoad/commit/768b9d751a613a0a10cb476d5c3eac5fdf44f627))
- compatibility with jasmine
 ([d4985e1d](https://github.com/ocombe/ocLazyLoad/commit/d4985e1d7ce98315ca64a72730d8c10524929d58),
 [#94](https://github.com/ocombe/ocLazyLoad/issues/94))


<a name="0.5.0"></a>
# 0.5.0 (2014-11-11)


## Features

- added a new param `insertBefore`
 ([c4f10385](https://github.com/ocombe/ocLazyLoad/commit/c4f10385cb6a9122c3a03d28b1bb6837710cc3f7),
 [#91](https://github.com/ocombe/ocLazyLoad/issues/91))
- started unit tests
 ([dcc4ff63](https://github.com/ocombe/ocLazyLoad/commit/dcc4ff639df23a1b934899b020a483e47e6ab290))


## Documentation

- updated loaders signatures
 ([ba022894](https://github.com/ocombe/ocLazyLoad/commit/ba022894841222989cf699f07fe21f04f7ad3307))


<a name="0.4.2"></a>
# 0.4.2 (2014-11-10)


## Bug Fixes

- extend config to params for the register method
 ([31157941](https://github.com/ocombe/ocLazyLoad/commit/31157941ccabfa8f8c55edc00dc2b5758bf073b2),
 [#89](https://github.com/ocombe/ocLazyLoad/issues/89))


<a name="0.4.1"></a>
# 0.4.1 (2014-11-09)


## Bug Fixes

- keep global params pristine when loading files
 ([6b2306b7](https://github.com/ocombe/ocLazyLoad/commit/6b2306b71543542c9b592766644c7bba1297bae4),
 [#89](https://github.com/ocombe/ocLazyLoad/issues/89))
- defining new run blocks will replace previous ones
 ([af2627b5](https://github.com/ocombe/ocLazyLoad/commit/af2627b5e627b2b4d83cdd043eff68b1c1430740),
 [#89](https://github.com/ocombe/ocLazyLoad/issues/89))


<a name="0.4.0"></a>
# 0.4.0 (2014-11-09)


## Features

- new parameter `serie` to load files in serie
 ([4ae7a3f3](https://github.com/ocombe/ocLazyLoad/commit/4ae7a3f3de6ad4de74baa6cc771aee556bce812e),
 [#47](https://github.com/ocombe/ocLazyLoad/issues/47), [#86](https://github.com/ocombe/ocLazyLoad/issues/86))
- new parameter `rerun` to rerun the run blocks
 ([26a64a38](https://github.com/ocombe/ocLazyLoad/commit/26a64a38b0c21b6ca28cfa7e512b0b290fdca619),
 [#89](https://github.com/ocombe/ocLazyLoad/issues/89))
- new function: `isLoaded` to check if a module has been loaded
 ([364c9e9f](https://github.com/ocombe/ocLazyLoad/commit/364c9e9ffd8350e5ca46a708bd3846ea6de9421c),
 [#79](https://github.com/ocombe/ocLazyLoad/issues/79))


<a name="0.3.10"></a>
# 0.3.10 (2014-11-09)


## Bug Fixes

- fix for error:[$compile:multidir] Multiple directives
 ([61fd4dd3](https://github.com/ocombe/ocLazyLoad/commit/61fd4dd3b8131245d33eb2314dcf37a9188a6728),
 [#84](https://github.com/ocombe/ocLazyLoad/issues/84),
 [#78](https://github.com/ocombe/ocLazyLoad/issues/78),
 [#73](https://github.com/ocombe/ocLazyLoad/issues/73),
 [#58](https://github.com/ocombe/ocLazyLoad/issues/58))
- css onload patch for some old browsers
 ([14ce3406](https://github.com/ocombe/ocLazyLoad/commit/14ce34066e0e865c8fa86f663d38e046f7a32abb))
- content inside the oc-lazy-load directive is now compiled on load
 ([9962e2ef](https://github.com/ocombe/ocLazyLoad/commit/9962e2ef163e9449e295dd3297f6019267a0e0e1),
 [#80](https://github.com/ocombe/ocLazyLoad/issues/80))


<a name="0.3.9"></a>
# 0.3.9 (2014-11-02)


## Bug Fixes

- allow components with the same name from different types/modules
 ([f981c337](https://github.com/ocombe/ocLazyLoad/commit/f981c33749e4e61fa4dfd7c3c41df9beffcbf734),
 [#67](https://github.com/ocombe/ocLazyLoad/issues/67))
- initial modules not registered
 ([bcf50004](https://github.com/ocombe/ocLazyLoad/commit/bcf50004b8a1172aff4c769746fdcb9e5d5d9cba),
 [#58](https://github.com/ocombe/ocLazyLoad/issues/58), [#71](https://github.com/ocombe/ocLazyLoad/issues/71), [#73](https://github.com/ocombe/ocLazyLoad/issues/73), [#77](https://github.com/ocombe/ocLazyLoad/issues/77))
- add support for angular 1.3 in bower
 ([bda921b6](https://github.com/ocombe/ocLazyLoad/commit/bda921b68ce30645d992982325adc4eebfdcd361),
 [#76](https://github.com/ocombe/ocLazyLoad/issues/76))


## Features

- broadcast for componentLoaded event provides more info (module name and type)
 ([d41b9f53](https://github.com/ocombe/ocLazyLoad/commit/d41b9f53a46ff8c97b780d4c24f6f64e16017b89))
- example1 now uses ui-grid instead of ng-grid
 ([e7cf1e83](https://github.com/ocombe/ocLazyLoad/commit/e7cf1e83ff1453ee5adb8112052d393f9dc09e27))


## Documentation

- added link to a new article by @kbdaitch
 ([cc6b41db](https://github.com/ocombe/ocLazyLoad/commit/cc6b41db5e0dbcfe68754df325bf9f09e5709bf2))
- added a link to a new lesson from egghead.io
 ([e231f3cb](https://github.com/ocombe/ocLazyLoad/commit/e231f3cbfd6fb3338479a5f4d8a9ce00d374646e))
- added a link to a new lesson from egghead.io
 ([9b3c48e4](https://github.com/ocombe/ocLazyLoad/commit/9b3c48e49800dd3ed6a01dad7c1d958f8625eddb))


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
