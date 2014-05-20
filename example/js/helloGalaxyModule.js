'use strict';

angular.module('HelloGalaxy', []).
    config(function() {
        console.log('HelloGalaxy::Config');
    }).
    factory('$galaxymessage', function() {
        return "Hello Galaxy";
    });
