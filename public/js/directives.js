'use strict';

angular.module('mean')
    .directive('jstree', function ($timeout, $parse) {
      return {
        restrict: 'A',
        require: '?ngModel',
        scope: {
          apiBase: '@',
          apiRoot: '@',
          selectedNode: '=',
          selectedNodeChanged: '=',
          onRename: '&'
        },
        link: function (scope, element, attrs) {

          var treeElement = $(element);
          var tree = treeElement.jstree({
            'core': {
              'multiple': false,
              'check_callback': true,
              'data': {
                'url': function (node) {
                  var pid = '0';
                  if (node.id === '#') { // root of tree
                    pid = '0';  // no parent
                  } else {
                    pid = $(node).attr('id'); // parent id
                  }
                  if(pid == '0')
                    return scope.apiBase;
                  else
                    return scope.apiBase + '?parent=' + pid;
                },
                'data': function (n) {
                  return n.attr ? n.attr('id') : 0;
                },
                'success': function (res) {
                  for (var i = 0; i < res.length; i++) {
                    if (res[i].parent == 0)
                      res[i].parent = '#';
                    //res[i].children = true;
                  }
                }
              }
            },
            'themes': {
              'theme': 'classic'
            },
            'plugins': ['themes', 'search', 'wholerow']
          });
          treeElement.on('select_node.jstree', function (node, data) {
            $timeout(function () {
              scope.selectedNode = data.node;
              if (scope.selectedNodeChanged) {
                $timeout(function () {

                  scope.selectedNodeChanged(scope.selectedNode);
                });
              }
            });
          });
          treeElement.on('rename_node.jstree', function (e, data) {
            $timeout(function () {
              if (scope.onRename) {
                var fn = scope.onRename();
                fn(e, data);
              }

            });
          })
          ;
        }
      };
    });