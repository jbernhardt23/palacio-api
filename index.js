var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type' :
	'text/html'});

	var moviesFile = fs.readFileSync('./moviesData.json', 'utf8');
	res.end(moviesFile);

});

var port = Number(process.env.PORT || 3000)
server.listen(port);