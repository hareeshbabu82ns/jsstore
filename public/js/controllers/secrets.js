'use strict';

angular.module('mean.secrets')
    .controller('SecretsController', ['$scope', '$routeParams', '$location', 'Global', 'mongular', '$http', '$timeout', 'growl', function ($scope, $routeParams, $location, Global, mongo, $http, $timeout, growl) {
      $scope.global = Global;
      $scope.secrets = [];
      $scope.secret = {};
//      mongo.all('secrets').getList({select: "title,email,modified,parent"})
//          .then(function (secrets) {
//            $scope.secrets = secrets;
//          });
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
        mongo.all('secrets').
            getList({$or: JSON.stringify(p)}).then(function (res) {
              $scope.secrets = res;
            });
      };
      $scope.parent = {};
      $scope.treeSel = function (treeItem) {
        $scope.parent = treeItem.original;
        mongo.all('secrets').getList({select: "title,email,modified,parent,favorite",
          parent: $scope.parent._id})
            .then(function (secrets) {
              $scope.secrets = secrets;
            });
      };
      $scope.treeReady = function (treeEle) {
        $(treeEle).jstree('select_node', $scope.selected.id);
      };
    }])
    .controller('SecretDetailController', ['$scope', '$routeParams', '$location', 'Global', 'mongular', '$http', '$timeout', 'growl', '$modal', function ($scope, $routeParams, $location, Global, mongular, $http, $timeout, growl, $modal) {
      $scope.global = Global;
      $scope.secret = {};
      if ($routeParams.secretId && $routeParams.secretId != 0) {
        mongular.one('secrets', $routeParams.secretId).get({populate: 'parent'}).then(function (res) {
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
      $scope.toggleFavorite = function () {
        if ($scope.secret._id) {//if not new
          $scope.secret.favorite = !$scope.secret.favorite;
          $scope.secret.put()
              .then(function () {
                growl.addSuccessMessage('updated');
              });
        }
      };
      $scope.parentSel = function () {
        //show parent tree model
        var modal = $modal.open({
          templateUrl: 'model_treesel.html',
          controller: 'ParSelCtrl',
          resolve: {
            item: function () {
              return $scope.secret.parent;
            }
          }
        });
        modal.result.then(function (selectedItem) {
          if (selectedItem.original._id) {
            if ($scope.secret.parent)
              angular.copy(selectedItem.original, $scope.secret.parent);
            else
              $scope.secret.parent = angular.copy(selectedItem.original);
            console.log($scope.secret.parent);
          }
          console.log(selectedItem.original._id);
        }, function () {

        });
      };
    }])
    .controller('ParSelCtrl', ['$scope', '$modalInstance', 'item', function ($scope, $modalInstance, item) {
      $scope.selected = item;
      $scope.treeSel = function (treeItem) {
        $scope.selected = treeItem;
      };
      $scope.parentSelOk = function () {
        $modalInstance.close($scope.selected);
      };
      $scope.parentSelCancel = function () {
        $modalInstance.dismiss('cancel');
      };
      $scope.treeReady = function (treeEle) {
        $(treeEle).jstree('select_node', $scope.selected.id);
      };
    }])
    .controller('SecTreeController', ['$scope', '$routeParams', 'mongular', '$http', 'growl', function ($scope, $routeParams, mongo, $http, growl) {
      $scope.currNode = {};
      $scope.qryText = '';
      $scope.treeRef;
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
              //var ref = $('#sampleTree').jstree(true);
              if (stitem.parent == 0)
                stitem.parent = '#';
              sel = $scope.treeRef.create_node(sel, stitem);
              $scope.treeRef.select_node(stitem);
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
              //var ref = $('#sampleTree').jstree(true);
            });
          }
        }
      };
      $scope.delete = function () {
        var sel = $scope.currNode.original;
        if (sel && sel.id && sel.id != '#') {
          mongo.one('sectree', sel._id).remove().then(function () {
            //var ref = $('#sampleTree').jstree(true);
            $scope.treeRef.delete_node(sel);
          });
        }
      };
      $scope.search = function () {
        //$('#sampleTree').jstree(true).search($scope.qryText);
        $scope.treeRef.search($scope.qryText);
      };
      $scope.treeAction = function (action) {
        $('#sampleTree').jstree(action);
      };
      $scope.treeReady = function (treeEle) {
        $scope.treeRef = $(treeEle).jstree(true);
        $scope.treeRef.open_all();
        $scope.$parent.treeReady(treeEle);
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