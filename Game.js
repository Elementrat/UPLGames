var fs = require("fs");
var PASWORD = "hunter2"
/*


*/
module.exports = function (app, io) {
	this.app = app;
	this.io = io;

	//determine if the cache file
	this.questions = JSON.parse(fs.readFileSync( "./questions.json", 'utf8'));

	this.teams = {};
	try {
		var save = JSON.parse(fs.readFileSync( "./cache_file.json", 'utf8'));
		for(var name in save){
			var team = save[name];
			this.teams[name] = team;
		}
	}
	catch(err) {
		console.log(err);
	}
	var self = this;

	app.post("/answer/", function (req, res) {
		var body = req.body, 
			team = body.team,
			questionId = body.questionId,
			token = body.token
		var status = self.answer(team, questionId, token);
		res.send(status);
	});

	app.get("/api/state", function(req, res) {
		res.send(self.teams);
	})

	app.get("/api/questions", function(req, res) {
		var out = self.questions.map(function(q){
			return {
				title : q.title,
				url : q.url,
				value : q.value,
				category: q.category,
			}
		})
		res.send(out);
	})

	app.post("/admin/add_points", function (req, res) {
		var body = req.body,
			team = body.team,
			points = body.points,
			password = body.password;

		if(password === PASWORD){
			if(self.teams[team] !== undefined){
				self.teams[team].score += points;
				self.save();
			}
		}
		res.send("1337Haxer");
	})

	app.post("/admin/remove_team", function (req, res) {
		var body = req.body,
			team = body.team,
			password = body.password;

		if(password === PASWORD){
			if(self.teams[team] !== undefined){
				delete self.teams[team];
				self.save();
			}
		}
		res.send("1337Haxer");
	})

	app.post("/admin/add_team", function (req, res) {
		var body = req.body,
			team = body.team,
			password = body.password;
		if(password === PASWORD){
			self.addTeam(team);
		}
		res.send("1337Haxer");
	})
}

//Error, Incorrect, Correct
module.exports.prototype.answer = function (team, questionId, token) {
	if(this.teams[team] === undefined
		|| this.questions[questionId] === undefined
		|| token === undefined
		|| this.teams[team].answers[questionId]) return "Error";

	if(this.questions[questionId].token === token) {
		this.teams[team].score+=this.questions[questionId].value;
		this.teams[team].answers[questionId] = 1;
		this.save();
		return "Correct"
	}else{
		return "False"
	}

}


module.exports.prototype.save = function () {
	fs.writeFileSync("./cache_file.json", JSON.stringify(this.teams));
	this.io.sockets.emit("save", this.teams);
}

module.exports.prototype.isTeamAvaiable = function (name) {
	if(name === undefined) return false;
	return this.teams[name] === undefined;
}

module.exports.prototype.addTeam = function (name) {
	var answers = new Array(this.questions.length);
	for(var i = 0; i < answers.length;i++){
		answers[i] = 0;
	}
	if(this.teams[name] === undefined){
		this.teams[name] = {
			name : name,
			score : 0,
			answers : answers
		}
		this.save();
		return true;
	}
	return false;
}