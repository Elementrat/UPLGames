

var app = angular.module("app", []);


var parseQuestions = function(questions) {
	var out = {};
	questions.forEach(function(q, index) {
		q.index = index;
		if(out[q.category] === undefined) out[q.category] = [];
		out[q.category].push(q)
	})
	return out;
}
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
	$scope.currentQuestion = { body: 'hello'}

	socket.on("save", function (data) {
		$scope.teams = data;
	})

	//for now assume team red until there is a lobby system. 
	$http.get("/api/state").success(function(value) {
		$scope.teams = value;
		$scope.team = value["Red"];
	})

	$http.get("/api/questions").success(function(value) {
		$scope.categories = parseQuestions(value)
		console.log($scope.categories)
	})

})