// var app = angular.module('codificaApp', ['ui.router', 'stormpath', 'stormpath.templates']);
//
// app.controller('DashboardCtrl', function($scope, $stormpath) {
//   $stormpath.uiRouter({
//     loginState: 'login',
//     defaultPostLoginState: 'home'
//   });
// });
//
// app.config(function($stateProvider) {
//   var dashboardState = {
//     name: 'dashboard',
//     url: '/dashboard',
//     templateUrl: 'dashboard.html',
//     sp: {
//       authenticate: true
//     }
//   };
//   $stateProvider.state(dashboardState);
// });
//
// app.run(function($stormpath) {
//   $stormpath.uiRouter({
//     loginState: 'login',
//     defaultPostLoginState: 'dashboard'
//   });
// });