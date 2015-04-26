

var socket = io.connect();
var app = angular.module("scoreboard", [])

app.controller("main", function ($scope, $http) {

	$scope.minHeight = 2;
	$scope.maxHeight = window.innerHeight - 80;
	$scope.maxScore = 100;
	$http.get("/api/state").success(function(teams) {
		$scope.teams =  teams;
	})

	socket.on("save", function (data) {
		$scope.teams = data;
		$scope.$apply();
	})
})