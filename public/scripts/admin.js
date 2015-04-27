var socket = io.connect();

var app = angular.module("admin", [])
	
app.controller("main", function ($scope, $http, $rootScope) {

	$rootScope.start = function () {
		$http.post("/admin/start", {
			password : $rootScope.password
		})
	}


	$rootScope.updatePassword = function (password) {
		$rootScope.password = password;
	}

	$rootScope.addTeam = function (teamName) {
		$http.post("/admin/add_team", {
			password : $rootScope.password,
			team : teamName
		})
	}

	$http.get("/api/state").success(function(teams) {
		$scope.teams =  teams;
	})

	socket.on("save", function (data) {
		$scope.teams = data;
		$scope.$apply();
	})

})

app.directive("teamedit", function ($http, $rootScope) {
	return {
		restrict : "A",
		templateUrl : "templates/teamedit.html",
		scope : {
			team : "=teamedit"
		},//ADD PROMT
		link : function (scope, element, attrs) {

			element.children(".delete").bind("click", function (e) {
				if(!confirm("Ya Sure?")) return;
				$http.post("/admin/remove_team", {
					password : $rootScope.password, //plain-text master race.
					team : scope.team.name
				})
			})

			element.children(".add").bind("click", function (e) {
				if(!confirm("Ya Sure?")) return;
				$http.post("/admin/add_points", {
					password : $rootScope.password, //plain-text master race.
					team : scope.team.name,
					points : parseFloat(scope.points)
				})
			})
		}

	}
})