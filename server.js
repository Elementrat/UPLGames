var express = require("express"),
	app = express(),
	bodyParser = require('body-parser'),
	http = require("http").Server(app),
	io = require("socket.io")(http),
	prompt = require("prompt"),
	fs = require("fs"),
	Game = require("./Game.js");//app, io, process.argv[2]);
	app.use(bodyParser.json());
	app.use(express.static(__dirname + "/public"));
	http.listen(8080);

	var game = new Game(app, io);


var express2 = require("express")
var app2 = express();
app2.use(express.static(__dirname + "/public/ettwo"));
var http2 = require("http").Server(app2)
http2.listen(1337)

/*



var game, questions;


var saveGame = function() {
	fs.writeFileSync("./cache_" + game.Name + ".json", JSON.stringify(game));
}

var createGame = function () {
	prompt.get(["Name", "Src"], function (err, results) {
		game = {};
		game.Name = results.Name;
		game.Src = results.Src;
		game.teams = {};
		questions = JSON.parse(fs.readFileSync( "./" + game.Src, 'utf8'));
		saveGame();
	})
}
*/
