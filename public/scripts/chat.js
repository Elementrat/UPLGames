var app = angular.module("chat", ["socket", "ngenter"]);

app.controller("main", function ($scope, socket) {
	$scope.messages = [];
	$scope.username;
	$scope.hasUsername = false;
	$scope.waitingOnServer = false;

	$scope.addMessage = function (message) {
		$scope.messages.push(message);
	}

	$scope.send = function (text) {
		if(text === undefined || text == "") return;
		if($scope.hasUsername){
			socket.emit("message", text);
			console.log("SENDING")
		}else if(!$scope.waitingOnServer){
			socket.emit("set_user", {username:text});
		}
		$("#input").val("");
	}

	socket.on("connect", function () {
		$scope.addMessage("Please Enter A Username...")
	})

	socket.on('set_user', function (data) {
		if(data.status == true){
			$scope.username = data.username;
			$scope.hasUsername = true;
			$scope.addMessage("Hello " + data.username);
		}else{
			$scope.addMessage("Username Unavailable");
			$scope.addMessage("Please Enter A Username...");
		}
		$scope.waitingOnServer = false;
	})

	socket.on("message", function (data) {
		$scope.addMessage(data);
	})

	socket.on('updatelist', function (data) {
		$scope.users = data;
	})
})

