var express = require('express');
var fs = require('fs');
var app = express();

app.set('port', (process.env.PORT || 80));


app.get('/', function (req, res) {

  var moviesFile = fs.readFileSync('./moviesData.json', 'utf8');
  res.json(JSON.parse(moviesFile));

});

app.listen(app.get('port'), function () {
  console.log('API response');
});