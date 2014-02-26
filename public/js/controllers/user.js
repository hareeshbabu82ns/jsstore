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
              angular.copy(resp.user, $scope.user);
            });
      };
      $scope.genOTP = function () {
        $http.get('/user/' + $scope.user._id + '/genotp')
            .success(function (resp) {
              angular.copy(resp.user, $scope.user);
              angular.copy(resp.user, Global.user);
            });
      };
      $scope.delOTP = function () {
        $http.get('/user/' + $scope.user._id + '/delotp')
            .success(function (resp) {
              angular.copy(resp.user, $scope.user);
              angular.copy(resp.user, Global.user);
            });
      };
    }]);