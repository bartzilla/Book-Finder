'use strict';

angular.module('booksApp')
  .controller('MosaicSearch', function ($scope, $http) {

    $scope.searchBook = function(){

      // Simple GET request example:
      $http({
        method: 'GET',
        url: "https://www.googleapis.com/books/v1/volumes?q=" + $scope.search + '&maxResults=11'
      }).then(function (response) {
        formatData(response.data.items);
        console.log('Done for: ', $scope.search);
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });
    };

    var formatData = function(rawData){

      $scope.data = [];

      for(var i = 0; i < rawData.length; i++) {
        $scope.data[i] = {
          thumbnail: getThumbnail(rawData[i].volumeInfo.imageLinks),
          title: rawData[i].volumeInfo.title ? rawData[i].volumeInfo.title : '',
          publisher: getPublisher(rawData[i].volumeInfo.publisher, rawData[i].volumeInfo.publishedDate),
          pageCount: rawData[i].volumeInfo.pageCount ? rawData[i].volumeInfo.pageCount : '',
          authors: getAuthors(rawData[i].volumeInfo.authors)
        };
      }
    };

    var getThumbnail = function (thumbnailUrl) {

      if(thumbnailUrl){
        var largeThumbnail = thumbnailUrl.thumbnail.replace(/(zoom=)[^\&]+/, '$1' + 1);

        // var newUrl = "?" + $.param(params);
        return largeThumbnail;
      }
      return '';
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
    };

    var myFunction = function() {
      window.alert('Yo')
    };
    
  });
