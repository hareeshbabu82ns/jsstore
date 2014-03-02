'use strict';

angular.module('mean.secrets')
    .controller('SecretsController', ['$scope', '$routeParams', '$location', 'Global', 'mongular', '$http', '$timeout', 'growl', function ($scope, $routeParams, $location, Global, mongo, $http, $timeout, growl) {
      $scope.global = Global;
      $scope.secrets = [];
      $scope.secret = {};
      mongo.all('secrets').getList({select: "title,email,modified"})
          .then(function (secrets) {
            $scope.secrets = secrets;
          });
      $scope.selected = function (lsecret) {
        return (lsecret._id == $scope.secret._id);
      };
      $scope.select = function (lsecret) {
        $scope.secret = lsecret;
      };
      $scope.search = function () {
        var p = [
          {title: "~" + $scope.searchStr},
          {email: "~" + $scope.searchStr},
          {username: "~" + $scope.searchStr},
          {url: "~" + $scope.searchStr},
          {note: "~" + $scope.searchStr}
        ];
        $scope.secrets.getList({$or: JSON.stringify(p)}).then(function (res) {
          $scope.secrets = res;
        });
      };
    }])
    .controller('SecretDetailController', ['$scope', '$routeParams', '$location', 'Global', 'mongular', '$http', '$timeout', 'growl', function ($scope, $routeParams, $location, Global, mongular, $http, $timeout, growl) {
      $scope.global = Global;
      $scope.secret = {};
      if ($routeParams.secretId && $routeParams.secretId != 0) {
        mongular.one('secrets', $routeParams.secretId).get().then(function (res) {
          $scope.secret = res;
        });
      }
      $scope.save = function () {
        if (_.isUndefined($scope.secret._id)) {
          mongular.all('secrets').post($scope.secret) // create
              .then(function (secret) {
                growl.addSuccessMessage('created');
                $location.path('secrets/' + secret._id);
              });
        } else
          $scope.secret.put() //update
              .then(function () {
                growl.addSuccessMessage('saved');
              });
      };
      $scope.delete = function () {
        if ($scope.secret) {
          $scope.secret.remove().then(function () {
            growl.addSuccessMessage('deleted');
            $location.path('secrets');
          });
        }
      };

    }])
    .config(['$routeProvider',
      function ($routeProvider) {
        $routeProvider.
            when('/secrets', {
              templateUrl: 'views/secrets/list.html'
            }).
            when('/secrets/create', {
              templateUrl: 'views/secrets/detail.html'
            }).
            when('/secrets/:secretId', {
              templateUrl: 'views/secrets/detail.html'
            });
      }
    ]);