var app = angular.module("app", ["socket", "ngenter"]);


var parseQuestions = function(questions) {
	var out = {};
	questions.forEach(function(q, index) {
		q.index = index;
		if(out[q.category] === undefined) out[q.category] = [];
		out[q.category].push(q)
	})
	return out;
}

app.controller("main", function ($scope, $http, socket) {
	$scope.currentQuestion = { body: ''}
	$scope.resultCode = '';
	$scope.currentTeam = {
		name : 'signedout',
		score: 0,
	}

	$scope.submitAnswer = function(text){
		$http.post("/api/answer/", {
			team: $scope.currentTeam.name,
			token : text,
			questionId: $scope.currentQuestion.index,
		}).success(function(data){
			console.log('success with' + data)
			$scope.resultCode = data;
			console.log(data=="success")

			if(data !="Correct"){
				$("#result").css("color", "red")
			}
			else{
				$("#result").css("color", "green")
			}

			$('#result').animate({opacity:1},400).animate({opacity:0},3000);

		})
	}

	$scope.setCurrentQuestion = function(question){
		$scope.currentQuestion = question
		$("#inputbox").css("display", "block")
		document.getElementById("answerfield").value= "";
		document.getElementById("bodytext").innerHTML = $scope.currentQuestion.body;
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
	})

	//for now assume team red until there is a lobby system. 
	$http.get("/api/state").success(function(value) {
		$scope.teams = value;
		$scope.team = value["Red"];
	})

	$http.get("/api/questions").success(function(value) {
		$scope.categories = parseQuestions(value)
	})

	$http.get("/api/timeleft").success(function(data) {
		$scope.time = {
			client : Date.now(),
			serverRemaining : data.time
		}
	})

	socket.on("timeleft", function (data) {
		$scope.time = {
			client : Date.now(),
			serverRemaining : data.time
		}
	})

	socket.on("questions", function (value) {
		$scope.categories = parseQuestions(value)
	})

})