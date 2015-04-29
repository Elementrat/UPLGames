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

// Production steps of ECMA-262, Edition 5, 15.4.4.21
// Reference: http://es5.github.io/#x15.4.4.21
if (!Array.prototype.reduce) {
  Array.prototype.reduce = function(callback /*, initialValue*/) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.reduce called on null or undefined');
    }
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }
    var t = Object(this), len = t.length >>> 0, k = 0, value;
    if (arguments.length == 2) {
      value = arguments[1];
    } else {
      while (k < len && !(k in t)) {
        k++; 
      }
      if (k >= len) {
        throw new TypeError('Reduce of empty array with no initial value');
      }
      value = t[k++];
    }
    for (; k < len; k++) {
      if (k in t) {
        value = callback(value, t[k], k, t);
      }
    }
    return value;
  };
}

var app = angular.module("app", ["socket", "ngenter"]);


var parseQuestions = function(questions) {
			console.log(questions.length)
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
	$scope.metaSolved = false;
	$scope.currentTeam = {
		name : 'signedout',
		score: 0,
		metaComplete : false,
	}
	$scope.gameActive = false;
	$scope.serverTime = 0;

	$scope.explode = function(){
		$http.get("/api/metasolved/").success(function(value){
			if(!value){
				for(var x= 0; x < 2; x++){
					var splode = document.createElement("img")
					var xpos = -200 + Math.random() * (window.innerWidth+100);
					var ypos = -200 + Math.random() * (window.innerHeight+100);
					splode.src = "img/explosion.gif"
					splode.style.left = xpos;
					splode.style.top = ypos;
					splode.style.position = "absolute"
					$(splode).addClass('explosion').appendTo($("body")) //main div
					$(splode).attr("src", "img/explosion.gif");
					 window.setTimeout( $scope.explode, Math.round(1 + Math.random() * 2)*1000 ); // 5 seconds
			}}
		})
	}


	$.countdown.setDefaults({description: ' to Launch', compact: true, onExpiry: $scope.explode});

	$scope.attemptcomplete = function(key){
		$http.post("/api/attemptmeta" , {team: $scope.currentTeam.name, phrase: $scope.currentTeam.phrase, key: key}).success(function(data){
			if(data.status){
				$("#countdown").countdown('pause')
				$("#countdown").css("color", "blue")
				console.log('you won')
			}
			else{
				$http.post("/api/meta" , {team: $scope.currentTeam.name, phrase: $scope.currentTeam.phrase}).success(function(data){
					var remainingkey = data.reduce(function(a,b){
						return a+b;
					}, "")

					$("#deactivatetext").val(remainingkey)
				})
			}
		})
	}

	$scope.submitAnswer = function(text){
		$http.post("/api/answer/", {
			team: $scope.currentTeam.name,
			token : text,
			questionId: $scope.currentQuestion.index,
			phrase : $scope.currentTeam.phrase
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
		$("#bodytext").html($scope.currentQuestion.body);
	}


	$scope.startGame= function(){
		$scope.gameActive = true;
		$("#countdown").countdown({until: $scope.serverTime/1000})
	}

	$scope.setCurrentTeam = function(phrase){
		$http.post("/api/get_team", {phrase : phrase}).success(function(response) {
			if(response.valid){
				$scope.currentTeam = $scope.teams[response.team];
				$scope.currentTeam.phrase = phrase;
				document.getElementById("nav").style.pointerEvents = "all"
				document.getElementById("login").style.display = "none"
				//$scope.setCurrentQuestion($scope.questions[0]);
				$scope.currentQuestion.title = "Welcome, " + $scope.currentTeam.name +"!";
				$("#bodytext").html("Tips for Puzzling Success <br> 1. Remember the category. <br> 2. Consider the title. It *could* be a hint. <br> 3. Think about how information could be encoded. <br> <br>Good luck. You are our only hopes.");
			}else{
				//@ALEX PLZ SIGNAL FAULURE	
			}
		})
		
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

	socket.on("metasolved", function (value) {
		$scope.metaSolved = true;
	})

})
