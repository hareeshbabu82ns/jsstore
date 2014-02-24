'use strict';

angular.module('mongular', [])
    .factory('mongular', function (Restangular) {
      var mongo = Restangular.withConfig(function (config) {
        config.setBaseUrl('/api');
        config.setRestangularFields({
          id: '_id'
        });
        config.setRequestInterceptor(function (ele, operation, what, url) {
          if (operation === 'PUT') {
            return _.omit(ele, '_id');
          } else
            return ele;
        });
        config.setParentless(true);
//        config.setFullRequestInterceptor(function (element, operation, route, url, headers, params) {
//          var ret = {
//            element: element,
//            params: params,
//            headers: headers
//          };
//          return ret;
//        });
      });
      mongo.localDelete = function (list, id) {
        jQuery.each(list, function (idx, ele) {
          if (ele._id === id) {
            list.splice(idx, 1);
            return false;
          }
        });
      };
      mongo.localUpdate = function (list, obj) {
        jQuery.each(list, function (idx, ele) {
          if (ele._id === obj._id) {
            list[idx] = mongo.copy(obj);
            return false;
          }
        });
      };
      mongo.localFind = function (list, id) {
        return _.find(list, function (obj) {
          return obj._id === id;
        });
      };
      return mongo;
    });
