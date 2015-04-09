(angular => {
    'use strict';

    angular.module('oc.lazyLoad').config(function($provide) {
        $provide.decorator('$ocLazyLoad', function ($delegate, $templateCache, $q, $http) {
            /**
             * templatesLoader function
             * @type Function
             * @param paths array list of css files to load
             * @param callback to call when everything is loaded. We use a callback and not a promise
             * @param params object config parameters for $http
             * because the user can overwrite templatesLoader and it will probably not use promises :(
             */
            $delegate.templatesLoader = function(paths, callback, params) {
                var promises = [],
                    filesCache = $delegate._getFilesCache();

                angular.forEach(paths, url => {
                    var deferred = $q.defer();
                    promises.push(deferred.promise);
                    $http.get(url, params).success(data => {
                        if(angular.isString(data) && data.length > 0) {
                            angular.forEach(angular.element(data), node => {
                                if(node.nodeName === 'SCRIPT' && node.type === 'text/ng-template') {
                                    $templateCache.put(node.id, node.innerHTML);
                                }
                            });
                        }
                        if(angular.isUndefined(filesCache.get(url))) {
                            filesCache.put(url, true);
                        }
                        deferred.resolve();
                    }).error(function(err) {
                        deferred.reject(new Error(`Unable to load template file "${ url }": ${ err }`));
                    });
                });
                return $q.all(promises).then(() => {
                    callback();
                }, err => {
                    callback(err);
                });
            };
            $delegate.templatesLoader.ocLazyLoadLoader = true;

            return $delegate;
        })
    });

})(angular);
