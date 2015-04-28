var app = angular.module("chat", ["socket", "ngenter"]);



app.controller("main", function ($scope, socket, $timeout) {
	window.onbeforeonload = function () {
		socket.disconnect();
	}
	$scope.messages = [];
	$scope.username;
	$scope.hasUsername = false;
	$scope.waitingOnServer = false;

	var EnterUserNameMessage = {
		username : "Mainframe",
		message : "Please Enter A Username..."
	}

	$scope.addMessage = function (message) {

		if(message.message.trim().charAt(0) == ">"){
			message.bluetext = true;
		}

		if(message.message.charAt(0) == "@"){
			message.orangetext = true;
		}


		$scope.messages.push(message);
		$timeout(function(){
			var d = $('#chatpanel');
			d.scrollTop(d.prop("scrollHeight"));
		})
	}

	$scope.send = function () {
		var text = $("#input").val();
		if(text === undefined || text == "") return;

		if(text.charAt(0) === "/"){
			if(text.indexOf("/set_admin") > -1 ){
				socket.emit("set_admin", { password : text.split(" ")[1]});
			}
			$("#input").val("");
		}else{
			if($scope.hasUsername){
				socket.emit("message", text);
				$("#input").val("");
			}else if(!$scope.waitingOnServer){
				if(text.length < 14){
					socket.emit("set_user", {username:text});
					$("#input").val("");
				}else{
					$scope.addMessage({username : "Mainframe", message : "Username Too Long"})
				}

			}
		}
		
	}

	socket.on("connect", function () {
		$scope.addMessage(EnterUserNameMessage)
	})

	socket.on('set_user', function (data) {
		if(data.status == true){
			$scope.username = data.username;
			$scope.hasUsername = true;
			$scope.addMessage({username : "Mainframe", message : "Welcome " + data.username});
		}else{
			$scope.addMessage({username : "Mainframe", message : "Username Unavailable"});
			$scope.addMessage(EnterUserNameMessage);
		}
		$scope.waitingOnServer = false;
	})

	socket.on("message", function (data) {
		$scope.addMessage(data);
	})

	socket.on('updatelist', function (data) {
		$scope.users = data;
	})

	socket.on("notify_answer", function (data) {
		$scope.addMessage({
			username : "Mainframe",
			message : "team " + data.team + " has answered " + data.title
		})
	})
})

