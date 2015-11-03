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

io.on('connection', function(socket){
	socket.on('request', function(req){
		var name = req.name;
		var year = req.year;
		var month = req.month;
		var day = req.day;
		var starSign = req.starSign;
		var fortuneUrlPath = fortuneApiUrlPathBase + year + "/" + month + "/" + day;
		request(fortuneApiUrlHost + "/" + fortuneUrlPath, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				var json = JSON.parse(body);
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
	});
});
var port = process.env.PORT || 3000;
http.listen(port, function(){
	console.log('listening on *:' + port);
});