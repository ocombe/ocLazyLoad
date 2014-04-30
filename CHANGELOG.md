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