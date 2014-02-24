'use strict';

angular.module('mean.system')
    .controller('UserController', ['$scope', 'Global', 'mongular', '$http', function ($scope, Global, mongular, $http) {
      $scope.global = Global;
      $scope.user = angular.copy(Global.user);

      $scope.user.pwd = $scope.rpwd = '';

      $scope.save = function () {
        $http.post('/user/' + $scope.user._id + '/update',
                $scope.user)
            .success(function (resp) {

            });
      };
    }]);