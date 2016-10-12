var Nightmare = require('nightmare');
var nightmare = Nightmare({show:true})
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var async = require('async');

var urlWeb = "http://www.palaciodelcine.com.do/info/splash/index.aspx";
var selectCity = "#ddl_city";
var selectTheater = "#ddl_theater";
var enterBtn = "#btn_enter";
var mainSelector = "#aspnetForm";
var flagReady = true;

var citiesObject = ["19","21","22","23"];

var complexObject = {

	19:["11","12","13","14","15"],
	21:["16"],
	22:["17"],
	23:["18","19"]
};


async.eachOfSeries(complexObject, function(item, keyDo, next){
	console.log(keyDo);

	async.eachOfSeries(item, function(items, keyDos, nexts){
	
		console.log(items);

nightmare
.goto(urlWeb)
.wait(selectCity)
.select(selectCity, keyDo.toString())
.wait(8000)
.select(selectTheater, items)
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
  		//moving on to weeKlyMovies
  		nightmare
  		.goto('http://www.palaciodelcine.com.do/info/showtimes/weekly.aspx')
  			.wait('.showtimeWeekly') //TODO have to wait for the DOM to be ready
  			.evaluate(function(){
  				return document.body.innerHTML;
  			})
  			.then(function(bodyWeekly){
  				var tempArray = [];
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
  					//trailer url
  					weeklyMoviesObject.urlTrailer = $(this).find('.showtimeTrailer').children('h2').children('a').attr('href');
  					//spanish title
  					weeklyMoviesObject.spanishTitle = $(this).find('h3').children('a').text();
  					//enlish title
  					weeklyMoviesObject.englishTitle = $(this).find('h4').text();
  					//language
  					weeklyMoviesObject.language = $(this).find('strong').text();

  					//full schedule

  					$($(this).find('tr')).each(function(i, trElement){
  						var count = 1;

  						$($(this).find('th')).each(function(k, thElement){

  							if($(this).text() != ""){		
  								weeklyMoviesObject.weekDaySchedule[$(this).text()] = [];
  							}
  						});

  						$($(this).find('ul')).each(function(l, ulElement){
  							
  							if($(this).children().is('li')){
  								tempArray = [];
  							}
  							
  							$($(this).find('li')).each(function(o, liElement){
  								tempArray.push($(this).text());
  							});
  							outerLoop:
  							for(var key in weeklyMoviesObject.weekDaySchedule){
  								if(weeklyMoviesObject.weekDaySchedule[key] == ""){
  									weeklyMoviesObject.weekDaySchedule[key] = tempArray;
  									break outerLoop;
  								}
  							}
  						});

  					});

  					$($(this).find('.showtimeData')).each(function(a, classElement){
  						if($(this).children().is('img')){

  							var tempString = $(this).text().replace(/\t/g, "");
  							tempString = tempString.trim();
  							tempString = tempString.split("\n").filter(String);

  							weeklyMoviesObject.showTimeData=(tempString);
  						}

  					});

  					// console.log(weeklyMoviesObject);
  				});	
  				//Moving on to cines page
  				nightmare
  				.goto('http://www.palaciodelcine.com.do/info/content/index.aspx?idSection=3')
  				.wait('.contentBlock')
  				.evaluate(function(){
  					return document.body.innerHTML;
  				})
  				.then(function(cines){
  				var $ = cheerio.load(cines);


  				$('.contentBlock').each(function(index, element){
  					var count = 0;
  					//Weekely object 
  					var theatherInformationObject = {

  						theatherName: "",
  						address: "",
  						ticketPrices: "",
  						phoneNumber: ""

  					}
  					//Theather name

  					//Description and prices
  					var tempString = $(this).find('p').text().replace(/\t/g, "");
  					tempString = tempString.trim();
  					tempString = tempString.split("\n").filter(String);


  					for(var key in theatherInformationObject){

  						theatherInformationObject[key] = tempString[count];
  						count++;

  					}
  					console.log(theatherInformationObject);

  				});
  					//nighmare to go 
  					nightmare
  					.goto('http://www.palaciodelcine.com.do/info/content/index.aspx?idSection=3')
  					.wait()
  					.click('a[href="../index.aspx?c=true"]')
  					.evaluate(function(){
  						return document.body.innerHTML;
  					})
  					.then(function (body) {
     					 console.log('Back to home');
     					 //executing next item on loop
     					 	 nexts();
     			

    				});
  										
  				});

  			});

  		});
			

    }, function(err){
    	if (err) return console.log(err);
    	console.log("done iterating inner")
    	 //executing next item on loop
    	next();

    });	
	
		
	}, function(err2){
		if (err2) return console.log(err);
		console.log("done iterating outer")
	});	
	



