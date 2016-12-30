angular.module('booksApp')
  .controller('BookDetailsCtrl', function ($scope, $dialog) {
    $scope.showModal = function(){
      $dialog.dialog({}).open('book-details-modal.html');
    }
  });



//
// function DialogDemoCtrl($scope, $timeout, $dialog){
//   $timeout(function(){
//     $dialog.dialog({}).open('modalContent.html');
//   }, 3000);
// }