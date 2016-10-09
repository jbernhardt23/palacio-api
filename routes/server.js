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
		 var dailyObjectArray = [];

		

  		//Looping on each div for seccion de Carterla para Hoy
  		$('.showtimeDaily').each(function(index, element){


  			 //Object holder for daily information
			 var dailyMoviesObject = {

		 		spanishTitle: "",
		 		englishTitle: "",
		 		scheduleToday: [],
		 		linkForImage: "",
		 		showTimeData: []
		 	}


  			var scheduleHoursArray = [];

  			//spanish title
  			dailyMoviesObject.spanishTitle = $(this).find('h3').children().text();
  			//english title
  			dailyMoviesObject.englishTitle = $(this).find('h4').text();
  			//schedule for today
  			 $($(this).find('li').children()).each(function(i, currentElement){
  					 scheduleHoursArray.push($(this).text());
  					});
  			dailyMoviesObject.scheduleToday = scheduleHoursArray;
  			//img for movie
  			dailyMoviesObject.linkForImage = $(this).find('img').attr('src');
  				//show time data such as gender, lenght, language
  			var showTimeDataArray = $(this).find('.showtimeData').text().replace(/\t/g, "");
  			showTimeDataArray = showTimeDataArray.split("\n").filter(String);
  			dailyMoviesObject.showTimeData = showTimeDataArray;
  			
  			dailyObjectArray.push(dailyMoviesObject);
  		});

  		nightmare
  			.goto('http://www.palaciodelcine.com.do/info/showtimes/weekly.aspx')
  			.wait() //TODO have to wait for the DOM to be ready
  			.evaluate(function(){
  				return document.body.innerHTML;
  			})
  			.then(function(bodyWeekly){
  				var tempArray = [];
  				var thElementDone = false;
  				var $ = cheerio.load(bodyWeekly);
  				$('.showtimeWeekly').each(function(index, element){
  						
  					//Object holder for weekly information
			 		var weeklyMoviesObject = {

		 			spanishTitle: "",
		 			englishTitle: "",
		 			weekDaySchedule: {

		 			},

		 			linkForImage: "",
		 			urlTrailer: "",
		 			language: "",
		 			showTimeData: []
		 		}

  					//movie picture	
  					weeklyMoviesObject.linkForImage = $(this).find('.showtimePic').children('img').attr('src');
  					//console.log($(this).find('.showtimePic').children('img').attr('src'));
  					//trailer url
  					weeklyMoviesObject.urlTrailer = $(this).find('.showtimeTrailer').children('h2').children('a').attr('href');
  					//console.log($(this).find('.showtimeTrailer').children('h2').children('a').attr('href'));
  					//spanish title
  					//console.log($(this).find('h3').children('a').text());
  					weeklyMoviesObject.spanishTitle = $(this).find('h3').children('a').text();
  					//enlish title
  					//console.log($(this).find('h4').text());
  					weeklyMoviesObject.englishTitle = $(this).find('h4').text();
  					//language
  					weeklyMoviesObject.language = $(this).find('strong').text();
  					//console.log($(this).find('strong').text());
  					//full schedule
  				
  					$($(this).find('tr')).each(function(i, trElement){
  							var count = 0;
  				
  						$($(this).find('th')).each(function(k, thElement){

  								if($(this).text() != ""){		
  								//weeklyMoviesObject.weekDaySchedule[$(this).text()] = [];
  							}
  						});

  						$($(this).find('ul')).each(function(l, ulElement){
  							
  							if($(this).children().is('li')){
  								count++;
  							//	console.log("fteye");
  								console.log(tempArray);	
  							 	tempArray = [];
  							}
  							
  						
  							$($(this).find('li')).each(function(o, liElement){
  									tempArray.push($(this).text());
  							});
  						});
  			
  					});
  	
  					//console.log($(this).find('.showtimeData').text().replace(/\t|\n/g, ""));		

  				});
  								

  			});
  				
      		console.log('Done!');


	});
	


	
	
	