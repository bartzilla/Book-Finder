angular.module('booksApp')
  .controller('BookDetailsCtrl', function ($scope, $http, selfLink) {

    $http({
      method: 'GET',
      url: selfLink
    }).then(function (response) {
      var book = response.data;
      $scope.book = {
        thumbnail: book.volumeInfo.imageLinks.thumbnail ? book.volumeInfo.imageLinks.thumbnail : '',
        title: book.volumeInfo.title ? book.volumeInfo.title : '',
        publisher: getPublisher(book.volumeInfo.publisher, book.volumeInfo.publishedDate),
        pageCount: book.volumeInfo.pageCount ? ' - ' + book.volumeInfo.pageCount + ' pages': '',
        authors: getAuthors(book.volumeInfo.authors),
        description: book.volumeInfo.description ? book.volumeInfo.description : ''
      };

    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });

    var getThumbnail = function (thumbnailUrl) {

      if(thumbnailUrl){
        // var largeThumbnail = thumbnailUrl.thumbnail.replace(/(zoom=)[^\&]+/, '$1' + 1);

        // var newUrl = "?" + $.param(params);
        return thumbnailUrl;
      }
      return '';
    };

    var getPublisher = function (publisher, date){
      var publishedDate = date ? new Date(date).getFullYear() : '';
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



  });