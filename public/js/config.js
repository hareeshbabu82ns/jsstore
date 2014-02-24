'use strict';

//Setting up route
angular.module('mean').config(['$routeProvider',
      function ($routeProvider) {
        $routeProvider.
            when('/', {
              templateUrl: 'views/index.html'
            }).
            when('/user/update', {
              templateUrl: 'views/user/update.html'
            }).
            otherwise({
              redirectTo: '/'
            });
      }
    ])//angular-growl config
    .config(['growlProvider', '$httpProvider', function (growlProvider, $httpProvider) {
      growlProvider.globalTimeToLive(5000);
      //growlProvider.globalEnableHtml(true);
      growlProvider.messagesKey("msgs");
      growlProvider.messageTextKey("text");
      growlProvider.messageSeverityKey("type");
      $httpProvider.responseInterceptors.push(growlProvider.serverMessagesInterceptor);
    }]);

//Setting HTML5 Location Mode
angular.module('mean').config(['$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);