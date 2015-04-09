(angular => {
    'use strict';

    angular.module('oc.lazyLoad').config(function($provide) {
        $provide.decorator('$ocLazyLoad', function ($delegate, $q) {
            /**
             * jsLoader function
             * @type Function
             * @param paths array list of js files to load
             * @param callback to call when everything is loaded. We use a callback and not a promise
             * @param params object config parameters
             * because the user can overwrite jsLoader and it will probably not use promises :(
             */
            $delegate.jsLoader = function(paths, callback, params) {
                var promises = [];
                angular.forEach(paths, path => {
                    promises.push($delegate.buildElement('js', path, params));
                });
                $q.all(promises).then(() => {
                    callback();
                }, err => {
                    callback(err);
                });
            };
            $delegate.jsLoader.ocLazyLoadLoader = true;

            return $delegate;
        })
    });

})(angular);
