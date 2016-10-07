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

		 //Object holder for daily information
		 var dailyMoviesObject = {

		 	spanishTitle: "",
		 	englishTitle: "",
		 	scheduleToday: [],
		 	linkForImage: "",
		 	showTimeData: []
		 }

	

  		//Looping on each div for seccion de Carterla para Hoy
  		$('.showtimeDaily').each(function(index, element){

  			var scheduleHoursArray = [];

  			//spanish title
  			//console.log($(this).find('h3').children().text());
  			dailyMoviesObject.spanishTitle = $(this).find('h3').children().text();
  			//english title
  			//console.log($(this).find('h4').text());
  			dailyMoviesObject.englishTitle = $(this).find('h4').text();


  			//schedule for today
  			//console.log($(this).find('li').children().text() + " ");
  			
  			 $($(this).find('li').children()).each(function(i, currentElement){
  					 scheduleHoursArray.push($(this).text());
  					});
  			dailyMoviesObject.scheduleToday = scheduleHoursArray;



  			//img for movie
  			//console.log($(this).find('img').attr('src'));
  			dailyMoviesObject.linkForImage = $(this).find('img').attr('src');
  				//show time data such as gender, lenght, language
  			//console.log($(this).find('.showtimeData').text());
  			var showTimeDataArray = $(this).find('.showtimeData').text().replace(/\t/g, "");
  			showTimeDataArray = showTimeDataArray.split("\n").filter(String);
  			var temp = showTimeDataArray.toString().replace(/" "/g, "");
  			console.log(temp);
  			temp = temp.split(",").filter(String);
  			dailyMoviesObject.showTimeData = showTimeDataArray;
  	
  			console.log(JSON.stringify(dailyMoviesObject));
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
  							console.log($(this).children().text());
  							//TODO scrap info 
  						}else{
  							console.log($(this).find('li').text());
  						}
  					});
  					//console.log($(this).find('.showtimeData').text());
  					console.log($(this).find('.showtimeData').text().replace(/\t|\n/g, ""));

  				});
  			});

      		console.log('Done!');


	});
	


	
	
	