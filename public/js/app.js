'use strict';

angular.module('mean', ['ngCookies', 'ngResource', 'ngRoute',
  'restangular', 'mongular', 'ui.bootstrap', 'ui.route',
  'mean.system', 'mean.otps','mean.secrets', 'ui.utils','angular-growl']);

angular.module('mean.system', []);
angular.module('mean.otps', []);
angular.module('mean.secrets', []);