'use strict';

angular.module('mean.system')
    .controller('HeaderController', ['$scope', 'Global', function ($scope, Global) {
      $scope.global = Global;

      $scope.menu = [
        {
          'title': 'OTPs',
          'link': 'otps'
        },
        {
          'title': 'Create OTP',
          'link': 'otps/create'
        }
      ];

      $scope.isCollapsed = false;
    }]);