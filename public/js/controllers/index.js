'use strict';

angular.module('mean.system').controller('IndexController',
    ['$scope', 'Global', 'mongular', function ($scope, Global, mongo) {
      $scope.global = Global;
      $scope.secrets = [];
      mongo.all('secrets').getList({select: "title,email,modified,favorite",
        favorite: true})
          .then(function (secrets) {
            $scope.secrets = secrets;
          });

      $scope.otps = [];
      mongo.all('otps').getList({select: "title,email,created,favorite",
        favorite: true})
          .then(function (otps) {
            $scope.otps = otps;
          });

    }]);