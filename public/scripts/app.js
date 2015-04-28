// delegate event for performance, and save attaching a million events to each anchor
document.addEventListener('click', function(event) {
  var target = event.target;
  if (target.tagName.toLowerCase() == 'a')
  {
      var port = target.getAttribute('href').match(/^:(\d+)(.*)/);
      if (port)
      {
         target.href = port[2];
         target.port = port[1];
      }
  }
}, false);

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
	$scope.gameActive = false;
	$scope.serverTime = 0;
	$.countdown.setDefaults({description: ' until detonation', compact: true});

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


	$scope.startGame= function(){
		$scope.gameActive = true;
		$("#countdown").countdown({until: $scope.serverTime/1000})
	}

	$scope.setCurrentTeam = function(team){
		$scope.currentTeam = team;
		document.getElementById("nav").style.pointerEvents = "all"
		document.getElementById("login").style.display = "none"
		//$scope.setCurrentQuestion($scope.questions[0]);
		$scope.currentQuestion.title = "Welcome, " + $scope.currentTeam.name +"!";
		$scope.currentQuestion.title += ""
	}

	socket.on("save", function (data) {
		for(var teamName in $scope.teams){
			if(data[teamName]===undefined){
				delete $scope.teams[teamName];
			}
		}
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

	//update in post request to get time
	//also in case where server said no
	//number returned / 1000
		$scope.serverTime = data.time;
		if(data.time>0){
	
			$scope.startGame();
		}
	})

	socket.on("timeleft", function (data) {
		console.log('time remainin' + data.time)
		$scope.serverTime = data.time;
		if(data.time>0){
			$scope.startGame()
		}
	})

	socket.on("questions", function (value) {
		$scope.categories = parseQuestions(value)
	})

})
