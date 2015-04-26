var app = angular.module("app", []);
/*
http://stackoverflow.com/questions/15417125/submit-form-on-pressing-enter-with-angularjs
*/
angular.module('app').directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter, {'event': event});
                    });

                    event.preventDefault();
                }
            });
        };
    });


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
	$scope.currentQuestion = { body: ''}
	$scope.resultCode = '';
	$scope.currentTeam = {
		name : 'signedout',
		score: 0,
	}

	$scope.submitAnswer = function(text){
		console.log(text)
		$http.post("/api/answer/", {
			team: $scope.currentTeam.name,
			token : text,
			questionId: $scope.currentQuestion.index,
		}).success(function(data){
			$scope.resultCode = data;
			document.getElementById("result").style.webkitAnimation = ""
			document.getElementById("result").style.webkitAnimation = "resultFade 2s"
		})
	}

	$scope.setCurrentQuestion = function(question){
		$scope.currentQuestion = question
		document.getElementById("inputbox").style.display = "block"
		document.getElementById("answerfield").value= "";
	}

	$scope.setCurrentTeam = function(team){
		$scope.currentTeam = team;
		document.getElementById("nav").style.pointerEvents = "all"
		document.getElementById("login").style.display = "none"
		//$scope.setCurrentQuestion($scope.questions[0]);
		$scope.currentQuestion.title = "Welcome, " + $scope.currentTeam.name +"!" +" Get Puzzling!"
	}

	socket.on("save", function (data) {
		for(var teamName in data) {
			if($scope.teams[teamName] === undefined) {
				$scope.teams[teamName] = data[teamName]
			}else{
				$scope.teams[teamName].score = data[teamName].score;
				$scope.teams[teamName].answers = data[teamName].answers;
			}
		}
		$scope.teams = data;
	})

	//for now assume team red until there is a lobby system. 
	$http.get("/api/state").success(function(value) {
		$scope.teams = value;
		$scope.team = value["Red"];
	})

	$http.get("/api/questions").success(function(value) {
		$scope.categories = parseQuestions(value)
	})

})