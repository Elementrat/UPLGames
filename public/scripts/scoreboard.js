
var teamwidth = 180;

var socket = io.connect();
var app = angular.module("scoreboard", [])

app.controller("main", function ($scope, $http) {

	$scope.minHeight = 2;
	$scope.maxHeight = (window.innerHeight *.90)- 80;
	$scope.maxScore = 30;
	$scope.serverTime = 0;
	$http.get("/api/timeleft").success(function(data) {
	console.log('timeleft' + data.time)
	//update in post request to get time
	//also in case where server said no
	//number returned / 1000
		$scope.serverTime = data.time;
		if(data.time>0){
			$("#countdown").countdown({until: $scope.serverTime/1000})			
		}
	})

	$.countdown.setDefaults({description: ' to Launch', compact: true});


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