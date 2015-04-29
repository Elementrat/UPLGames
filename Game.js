var fs = require("fs");
var PASSWORD = "hunter2"
var ENDGAME = "ALL YOUR PASS PHRASES ARE BELONG TO US"

/**/

module.exports = function (app, io) {
	this.app = app;
	this.io = io;
	this.startTime = null;
	this.timeToRun = 9000000; //9000000;
	this.metaSolved = false;

	//determine if the cache file
	this.questions = JSON.parse(fs.readFileSync( "./questions.json", 'utf8'));

	this.teams = {};
	try {
		var obj = JSON.parse(fs.readFileSync( "./cache_file.json", 'utf8'));
		var save = obj.teams;
		this.startTime = obj.startTime;
		for(var name in save){
			var team = save[name];
			this.teams[name] = team;
		}
	}
	catch(err) {
		console.log(err);
	}
	var self = this;

	app.post("/api/answer/", function (req, res) {
		var body = req.body, 
			team = body.team,
			phrase = body.phrase,
			questionId = body.questionId,
			token = body.token
		var status = self.answer(team, phrase, questionId, token);
		res.send(status);
	});

	app.get("/api/state", function(req, res) {
		res.send(self.getSafeTeams());
	})


	app.get("/api/metasolved", function(req, res) {
		res.send(self.metaSolved);
	})

	app.get("/api/questions", function(req, res) {
		var out;
		if(self.startTime !== null){
			out = self.questions.map(function(q){
				return {
					title : q.title,
					url : q.url,
					value : q.value,
					body: q.body,
					category: q.category,
				}
			})
		}else{
			out = [];
		}
		
		res.send(out);
	})

	app.get("/api/timeleft", function(req, res) {
		if(self.startTime == null){
			res.send({time : -9999999999});
		}else{
			res.send({ time : self.timeToRun - (Date.now() - self.startTime)});
		}
		
	})

	app.post("/api/get_team", function (req, res) {
		var body = req.body,
			phrase = body.phrase;

			var valid = false;
			for(var teamName in self.teams){
				if(self.teams[teamName].phrase === phrase){
					res.send({valid : true, team : teamName});
					valid = true;
					break;
				}
			}
			if(!valid){
				res.send({valid : false});
			}
	});

	app.post("/api/meta", function (req, res) {
		var body = req.body,
			team = body.team,
			phrase = body.phrase;

		if(phrase === undefined
			|| team === undefined
			|| self.teams[team] === undefined
			|| self.teams[team].phrase !== phrase){
			res.send("gtfo")
			return;
		}

		var out = [];
		var answers = self.teams[team].answers;

		for(var i = 0; i < ENDGAME.length;i++){
			var c  = ENDGAME.charAt(i);
			if(answers[i]){
				out[i] = c;
			}else{
				out[i] = "?"
			}
		}

		res.send(out);
	})


	app.post("/api/attemptmeta", function (req, res) {
		var body = req.body,
			team = body.team,
			phrase = body.phrase;

		var out = {}

		if(phrase === undefined
			|| team === undefined
			|| self.teams[team] === undefined
			|| self.teams[team].phrase !== phrase){
			res.send("gtfo")
			return;
		}

		console.log(body.key)
		if(body.key === ENDGAME){
			
			out.status = true;
			self.teams[team].metaComplete = true;
			self.save();
		}
		else{
			out.status = false;
		}

		res.send(out);
	})

	app.post("/admin/start", function (req, res) {
		var body = req.body,
			password = body.password;

		if(password === PASSWORD){
			self.startTime = Date.now();
			var out = self.questions.map(function(q){
				return {
					title : q.title,
					url : q.url,
					value : q.value,
					body: q.body,
					category: q.category,
				}
			})
			io.sockets.emit("timeleft", {time : self.timeToRun - (Date.now() - self.startTime)})
			io.sockets.emit("questions", out)
			console.log("GAME HAS STARTED!!!!!");
			self.save();
		}
		res.send("1337Haxer");
	})

	app.post("/admin/add_points", function (req, res) {
		var body = req.body,
			team = body.team,
			points = body.points,
			password = body.password;

		if(password === PASSWORD){
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

		if(password === PASSWORD){
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
			phrase = body.phrase,
			password = body.password;
		if(password === PASSWORD){
			self.addTeam(team, phrase);
		}
		res.send("1337Haxer");
	})

	
}

//Error, Incorrect, Correct
module.exports.prototype.answer = function (team, phrase, questionId, token) {
	if(this.teams[team] === undefined
		|| this.questions[questionId] === undefined
		|| token == null 
		|| token === undefined
		|| phrase === undefined 
		|| this.teams[team].phrase !== phrase) return "Error";


	if(this.teams[team].answers[questionId]) return "Answered"

	if(this.questions[questionId].token === token.replace(" ","").toLowerCase()) {
		this.teams[team].score+=this.questions[questionId].value;
		this.teams[team].answers[questionId] = 1;
		this.save();
		this.io.sockets.emit("notify_answer", {team : team, title : this.questions[questionId].title})
		return "Correct"
	}else{
		return "Incorrect"
	}
}


module.exports.prototype.save = function () {
	fs.writeFileSync("./cache_file.json", JSON.stringify({
		startTime : this.startTime,
		teams : this.teams
	}));
	this.io.sockets.emit("save", this.getSafeTeams());
}

module.exports.prototype.getSafeTeams = function () {
	var out = {};
	for(var teamName in this.teams){
		var team = this.teams[teamName];
		out[teamName] = {
			name : team.name,
			score : team.score,
			answers : team.answers,
			metaComplete: team.metaComplete
		}
	}
	return out;
}

module.exports.prototype.isTeamAvaiable = function (name) {
	if(name === undefined) return false;
	return this.teams[name] === undefined;
}

module.exports.prototype.addTeam = function (name, phrase) {
	var answers = new Array(this.questions.length);
	for(var i = 0; i < answers.length;i++){
		answers[i] = 0;
	}
	if(this.teams[name] === undefined){
		this.teams[name] = {
			name : name,
			score : 0,
			answers : answers,
			phrase : phrase,
			metaComplete : false
		}
		this.save();
		return true;
	}
	return false;
}