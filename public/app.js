

var app = angular.module("app", []);

app.factory("socket", function ($rootScope) {
	var socket = io.connect();
	return {
		on : function(name, callback) {
			socket.on(name, function () {
				var args = arguments;
				$rootScope.$apply(function(){
					callback.apply(socket, args)
				})
			})
		}, 
		emit : function (name, data) {
			socket.emit(name, data);
		}
	}
})
app.controller("main", function ($scope, $http, socket) {

	socket.on("save", function (data) {
		$scope.teams = data;
	})

	//for now assume team red until there is a lobby system. 
	$http.get("/api/state").success(function(value) {
		$scope.teams = value;
		$scope.team = value["Red"];
	})

	$http.get("/api/questions").success(function(value) {
		$scope.questions = value;
	})

})