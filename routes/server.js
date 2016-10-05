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
	.wait(8000)
	.select(selectTheater, '12')
	.wait(1000)
	.click(enterBtn)
	.wait(mainSelector)
	.evaluate(function(){

			//returning HTML for cheerio
			return document.body.innerHTML;	
	})
	.then(function(bodyDaily){
		// Loading HTML body on jquery cheerio
		 var $ = cheerio.load(bodyDaily);

  		//Looping on each div for seccion de Carterla para Hoy
  		$('.showtimeDaily').each(function(index, element){
  			//spanish title
  			console.log($(this).find('h3').children().text());
  			//english title
  			console.log($(this).find('h4').text());
  			//schedule for today
  			console.log($(this).find('li').children().text() + " ");
  			//img for movie
  			console.log($(this).find('img').attr('src'));
  				//show time data such as gender, lenght, language
  			console.log($(this).find('.showtimeData').text());
  			var showtimeData = $(this).find('.showtimeData').text();
  			//console.log(JSON.stringify(showtimeData.replace(/\t|\n/g, "")));
  		});

  		nightmare
  			.goto('http://www.palaciodelcine.com.do/info/showtimes/weekly.aspx')
  			.wait() //TODO have to wait for the DOM to be ready
  			.evaluate(function(){
  				return document.body.innerHTML;
  			})
  			.then(function(bodyWeekly){

  				var $ = cheerio.load(bodyWeekly);
  				$('.showtimeWeekly').each(function(index, element){
  					//movie picture	
  					console.log($(this).find('.showtimePic').children('img').attr('src'));
  					//trailer url
  					console.log($(this).find('.showtimeTrailer').children('h2').children('a').attr('href'));
  					//spanish title
  					console.log($(this).find('h3').children('a').text());
  					//enlish title
  					console.log($(this).find('h4').text());
  					//language
  					console.log($(this).find('strong').text());
  					//full schedule
  					$($(this).find('tr')).each(function(i, currentElement){
  				
  						if($(this).children().is('th')){
  							console.log("true");
  							//TODO scrap info 
  						}
  					});
  				});
  			});

      		console.log('Done!');


	});
	


	
	
	