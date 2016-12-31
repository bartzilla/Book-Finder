'use strict';

angular.module('booksApp')
  .controller('MosaicSearch', function ($scope, $http, $uibModal) {

    $scope.busy = false;
    $scope.allData = [];
    $scope.books = [];
    var step = 0;

    $scope.open = function () {
      $uibModal.open({
        animation: false,
        // ariaLabelledBy: 'modal-title',
        // ariaDescribedBy: 'modal-body',
        templateUrl: 'app/book-details-modal/book-details-modal.html',
        controller: 'BookDetailsCtrl'
        // controllerAs: '$ctrl',
        // size: size,
        // appendTo: parentElem,
        // resolve: {
        //   items: function () {
        //     return $ctrl.items;
        //   }
        // }
      });
    };


    $scope.searchBook = function(){
      if($scope.search !== ''){
        $scope.books = [];
        step = 0;
        $scope.nextPage();
      }
    };

    $scope.nextPage = function() {

      // $scope.search = 'harry potter';
      if($scope.busy || $scope.search === undefined) return;

      $scope.busy = true;
      $http({
        method: 'GET',
        url: "https://www.googleapis.com/books/v1/volumes?q=" + $scope.search + '&startIndex='+ step +'&maxResults=40'
      }).then(function (response) {
        formatData(response.data.items);
        step +=40;
        $scope.busy = false;
        console.log('Not busy');
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
          title: rawData[i].volumeInfo.title ? rawData[i].volumeInfo.title.toUpperCase() : '',
          publisher: getPublisher(rawData[i].volumeInfo.publisher, rawData[i].volumeInfo.publishedDate),
          pageCount: rawData[i].volumeInfo.pageCount ? rawData[i].volumeInfo.pageCount : '',
          authors: getAuthors(rawData[i].volumeInfo.authors)
        };
      }
      $scope.books = $scope.books.concat($scope.data);
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
        return authorString.toUpperCase().substring(1);
      }

      return 'Unknown';
    };

  });
