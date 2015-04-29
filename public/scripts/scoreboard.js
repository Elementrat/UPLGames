
var teamwidth = 140;

var socket = io.connect();
var app = angular.module("scoreboard", [])

app.controller("main", function ($scope, $http) {

	$scope.minHeight = 2;
	$scope.maxHeight = (window.innerHeight *.90)- 80;
	$scope.maxScore = 30;

	$scope.resize = function(width){
		console.log("sizing to " + width)
		$("#grid").css("width", width+"px")
	}

	$http.get("/api/state").success(function(teams) {
		$scope.teams =  teams;
		var gridwidth = Object.keys($scope.teams).length * (teamwidth + 30)
		$scope.resize(gridwidth); 
	})

	socket.on("save", function (data) {
		$scope.teams = data;
		$scope.$apply();

		var gridwidth = Object.keys($scope.teams).length * (teamwidth + 30)
		$scope.resize(gridwidth); 		
		
	})
})