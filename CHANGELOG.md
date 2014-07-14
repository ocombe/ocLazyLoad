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