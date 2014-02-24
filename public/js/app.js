'use strict';

angular.module('mean', ['ngCookies', 'ngResource', 'ngRoute',
  'restangular', 'mongular', 'ui.bootstrap', 'ui.route',
  'mean.system', 'mean.otps', 'ui.utils','angular-growl']);

angular.module('mean.system', []);
angular.module('mean.otps', []);