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
        mongular.one('secrets', $routeParams.secretId).get({populate:'parent'}).then(function (res) {
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
    .controller('SecTreeController', ['$scope', '$routeParams', 'mongular', '$http', 'growl', function ($scope, $routeParams, mongo, $http, growl) {
      $scope.currNode = {};
      $scope.qryText = '';
      $scope.create = function () {
        var par = 0;
        var sel = $scope.currNode;
        if (sel.id === undefined || sel.id == '#') {
          sel = {id: '#'};
        } else {
          par = sel.id;
        }
        var txt = $scope.qryText;
        txt = (txt && txt.length) ? txt : 'new node';
        mongo.all('sectree').post({text: txt, parent: par})
            .then(function (stitem) {
              var ref = $('#sampleTree').jstree(true);
              console.log(stitem);
              if (stitem.parent == 0)
                stitem.parent = '#';
              sel = ref.create_node(sel, stitem);
              ref.select_node(stitem);
            });
      };
      $scope.rename = function (e, data) {
        var sel = data.node.original;
        if (sel && sel.id) {
          if (data.text != data.old) {
            sel.text = data.text;
            if (sel.parent == '#')
              sel.parent = 0;
            mongo.one('sectree', sel._id).customPUT(sel).then(function () {
              var ref = $('#sampleTree').jstree(true);
            });
          }
        }
      };
      $scope.delete = function () {
        var sel = $scope.currNode.original;
        if (sel && sel.id && sel.id != '#') {
          mongo.one('sectree', sel._id).remove().then(function () {
            var ref = $('#sampleTree').jstree(true);
            ref.delete_node(sel);
          });
        }
      };
      $scope.search = function () {
        $('#sampleTree').jstree(true).search($scope.qryText);
      };
      $scope.treeAction = function (action) {
        $('#sampleTree').jstree(action);
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