'use strict';

angular.module('booksApp')
  .controller('MainCtrl', function ($scope, $http, NgTableParams) {

    $scope.searchBook = function(){

      // Simple GET request example:
      $http({
        method: 'GET',
        url: "https://www.googleapis.com/books/v1/volumes?q=" + $scope.search
      }).then(function (response) {
         formatData(response.data.items);
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });
    };

    var formatData = function(rawData){
      console.log('This is the raw data: ', rawData);

      var data = [];

      for(var i = 0; i < rawData.length; i++) {
        data[i] = {
          smallThumbnail: rawData[i].volumeInfo.imageLinks.smallThumbnail,
          title: rawData[i].volumeInfo.title ? rawData[i].volumeInfo.title : '',
          publisher: getPublisher(rawData[i].volumeInfo.publisher, rawData[i].volumeInfo.publishedDate),
          pageCount: rawData[i].volumeInfo.pageCount ? rawData[i].volumeInfo.pageCount : '',
          authors: getAuthors(rawData[i].volumeInfo.authors)
        };
      }

      $scope.tableParams = new NgTableParams({}, { dataset: data});
    };

    var getPublisher = function (publisher, date){
      var publishedDate = date ? date : '';
      var publiserName = publisher ? publisher : '';
      return publiserName + ', ' + publishedDate;
    };

    var getAuthors = function (authors) {

      if(authors) {
        var authorString = '';

        for (var i = 0; i < authors.length; i++) {
          authorString += ', ' + authors[i];
        }
        return authorString.substring(1);
      }

      return 'Unknown';
    }

  });
