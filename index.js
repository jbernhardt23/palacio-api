var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req, res){
	
	res.setHeader('Access-Control-Allow-Headers', req.header.origin);
	res.writeHead(200, {'Content-Type' :
	'application/json'});

	var moviesFile = fs.readFileSync('./moviesData.json', 'utf8');
	res.write(JSON.stringify(JSON.parse(moviesFile)));
	res.end();

});

var port = Number(process.env.PORT || 3000)
server.listen(port);