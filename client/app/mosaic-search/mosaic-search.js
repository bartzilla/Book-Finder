'use strict';

angular.module('booksApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('mosaic-search', {
        url: '/mosaic-search',
        templateUrl: 'app/mosaic-search/mosaic-search.html',
        controller: 'MosaicSearch'
      });
  });