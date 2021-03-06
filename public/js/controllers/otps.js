'use strict';

angular.module('mean.otps')
    .controller('OtpsController', ['$scope', '$routeParams', '$location', 'Global', 'mongular', '$http', '$timeout', 'growl', function ($scope, $routeParams, $location, Global, mongo, $http, $timeout, growl) {
      $scope.global = Global;
      $scope.otps = [];
      $scope.otp = {};
      mongo.all('otps').getList({select: "title,email,created,favorite"})
          .then(function (otps) {
            $scope.otps = otps;
          });
      $scope.selected = function (lotp) {
        return (lotp._id == $scope.otp._id);
      };
      $scope.select = function (lotp) {
        $scope.otp = lotp;
        $scope.genOTP();
      };
      $scope.search = function () {
        var p = [
          {title: "~" + $scope.searchStr},
          {email: "~" + $scope.searchStr}
        ];
        $scope.otps.getList({$or: JSON.stringify(p)}).then(function (res) {
          $scope.otps = res;
        });
      };
      $scope.gOTP = '';
      $scope.genOTP = function () {
        if (_.isUndefined($scope.otp._id)) {
          //new - no action
        } else {
          $http.get('/api/otp/' + $scope.otp._id + '/genotp')
              .success(function (res) {
                if (res.err) {
                  //something went wrong
                } else {
                  $scope.gOTP = res.otp;
                }
              });
        }
      };
      //timer
      $scope.countDown = 0;
      var timerTick = function () {
        var epoch = Math.round(new Date().getTime() / 1000.0);
        $scope.countDown = 30 - (epoch % 30);
        if (epoch % 30 === 0) {
          $scope.genOTP();
        }
        $(".dialOTP").val(epoch % 30).trigger('change');
        mytimeout = $timeout(timerTick, 1000);
      };
      var mytimeout = $timeout(timerTick, 1000);
      $scope.$on('$destroy', function () {
        $timeout.cancel(mytimeout);
      });
    }])
    .controller('OtpDetailController', ['$scope', '$routeParams', '$location', 'Global', 'mongular', '$http', '$timeout', 'growl', function ($scope, $routeParams, $location, Global, mongular, $http, $timeout, growl) {
      $scope.global = Global;
      $scope.otp = {};
      if ($routeParams.otpId && $routeParams.otpId != 0) {
        mongular.one('otps', $routeParams.otpId).get().then(function (res) {
          $scope.otp = res;
          $scope.genOTP();
        });
      }
      $scope.gOTP = '';
      $scope.genOTP = function () {
        if (_.isUndefined($scope.otp._id)) {
          //new - no action
        } else {
          return $http.get('/api/otp/' + $scope.otp._id + '/genotp')
              .success(function (res) {
                if (res.err) {
                  //something went wrong
                } else {
                  $scope.gOTP = res.otp;
                }
              });
        }
      };
      $scope.updKey = function () {
        if (_.isUndefined($scope.otp._id)) {
          //new - no action
        } else {
          $http.post('/api/otp/' + $scope.otp._id + '/updkey',
              {key: $scope.otp.key})
              .success(function (res) {
                if (res.err) {
                  //something went wrong
                }
              });
        }
      };
      $scope.save = function () {
        if (_.isUndefined($scope.otp._id)) {
          mongular.all('otps').post($scope.otp) // create
              .then(function (otp) {
                growl.addSuccessMessage('created');
                $location.path('otps/' + otp._id);
              });
        } else
          $scope.otp.put() //update
              .then(function () {
                growl.addSuccessMessage('saved');
              });
      };
      $scope.delete = function () {
        if ($scope.otp) {
          $scope.otp.remove().then(function () {
            growl.addSuccessMessage('deleted');
            $location.path('otps');
          });
        }
      };
      $scope.toggleFavorite = function () {
        if ($scope.otp._id) {//if not new
          $scope.otp.favorite = !$scope.otp.favorite;
          $scope.otp.put()
              .then(function () {
                growl.addSuccessMessage('updated');
              });
        }
      };
      //timer
      $scope.countDown = 0;
      var timerTick = function () {
        var epoch = Math.round(new Date().getTime() / 1000.0);
        //$scope.countDown = 30 - (epoch % 30);
        if (epoch % 30 === 0) {
          $scope.genOTP();
        }
        $(".dialOTP").val(epoch % 30).trigger('change');
        mytimeout = $timeout(timerTick, 1000);
      };
      var mytimeout = $timeout(timerTick, 1000);
      $scope.$on('$destroy', function () {
        $timeout.cancel(mytimeout);
      });
    }])
    .config(['$routeProvider',
      function ($routeProvider) {
        $routeProvider.
            when('/otps', {
              templateUrl: 'views/otps/list.html'
            }).
            when('/otps/create', {
              templateUrl: 'views/otps/detail.html'
            }).
            when('/otps/:otpId', {
              templateUrl: 'views/otps/detail.html'
            });
      }
    ]);