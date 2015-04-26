var express = require("express"),
	app = express(),
	http = require("http").Server(app),
	io = require("socket.io")(http)
	
	app.use(express.static(__dirname + "/public"));
	http.listen(4200);


	var users = {};
	io.sockets.on('connection', function(socket) {

		socket.on("set_user", function(data) {
			if(users[data.username] === undefined){
				socket.username = data.username;
				socket.emit("set_user", { status : true, username : data.username });
				users[data.username] = true;
				io.sockets.emit("updatelist", users);
			}else{
				socket.emit("set_user", { status : false})
			}
		})

		socket.on("message", function (data) {
			if(socket.username === undefined) return;
			io.sockets.emit("message", socket.username + " : " + data);
		})

		socket.on("disconnect", function (e) {
			delete users[socket.username];
			io.sockets.emit("updatelist", users);
		})
			
	})