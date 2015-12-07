require('angular')
var mainController = require('./controller/MainController.js')

var app = angular.module('app', [])
app.controller('MainController', ['$scope', mainController])
