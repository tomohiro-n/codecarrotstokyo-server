//FIXME convert to ES6 style with babel

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});


var fortuneApiUrlHost = "http://api.jugemkey.jp";
var fortuneApiUrlPathBase = "api/horoscope/free/";
var results = {};

app.get('/tellme', function(req, res) {
	res.header('Access-Control-Allow-Origin', '*');
	var year = req.query.year;
	var month = req.query.month;
	var day = req.query.day;
	if (!year || !month || !day) {
		res.send({horoscope: "error, some parameters are not invalid..."});
		return;
	}
	var fortuneUrl = getFortuneUrl(year, month, day);
	request(fortuneUrl, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			res.send(body);
			return;
		}
	});
});

io.on('connection', function(socket){
	socket.on('request', function(req){
		var name = req.name;
		var year = req.year;
		var month = req.month;
		var day = req.day;
		var starSign = req.starSign;
		var fortuneUrl = getFortuneUrl(year, month, day);
		if (name && year && month && day && starSign) {
			request(fortuneUrl, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					var json = JSON.parse(body);
					if (!json || !json.horoscope) return;
					var data = json.horoscope[year + "/" + month + "/" + day];
					var result;
					for (var i = 0; i < data.length; i++) {
						if (data[i].sign == starSign) {
							result = data[i];
						}
					}
					if (result) {
						console.log(result);
						io.emit('result', {name: name, year: year, month: month, day: day, result: result});
					}
				}
			});
		}
	});
});

var getFortuneUrl = function (year, month, day) {
	return fortuneApiUrlHost + "/" + fortuneApiUrlPathBase + year + "/" + month + "/" + day;
}

var port = process.env.PORT || 3000;
http.listen(port, function(){
	console.log('listening on *:' + port);
});