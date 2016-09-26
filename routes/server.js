var Nightmare = require('nightmare');
var nightmare = Nightmare({show:true})
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

var urlWeb = "http://www.palaciodelcine.com.do/info/splash/index.aspx";
var selectCity = "#ddl_city";
var selectTheater = "#ddl_theater";
var enterBtn = "#btn_enter";
var mainSelector = "#aspnetForm";
var flagReady = true;

nightmare
	.goto(urlWeb)
	.wait(selectCity)
	.select(selectCity, '19')
	.wait(6000)
	.select(selectTheater, '12')
	.wait(1000)
	.click(enterBtn)
	.wait(mainSelector)
	.evaluate(function(){

			//returning HTML for cheerio
			return document.body.innerHTML;	
	})
	.then(function(body){
		//loading body to cheerio
  		var $ = cheerio.load(body);

  		//Looping on each div for Carterla para Hoy
  		$('.showtimeDaily').each(function(index, element){
  			console.log("---Titulo en Espaniol--");
  			console.log($(this).find('h3').children().text());
  			console.log("---Titulo en Ingles--");
  			console.log($(this).find('h4').text());


  			console.log($(this).find('li').children().text());

  		})
		//console.log($.html());



	})
	