'use strict';

angular.module('booksApp')
  .controller('NavbarCtrl', function ($scope, $location) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    }];

    $scope.isCollapsed = true;

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.getRef = function() {
      return $location.path() === '/' ? '#all' : '/';
    };
  });