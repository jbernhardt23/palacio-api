var Nightmare = require('nightmare');
var nightmare = Nightmare({
  show: true


});

var fs = require('fs');
var cheerio = require('cheerio');
var async = require('async');

var urlWeb = "http://www.palaciodelcine.com.do/info/splash/index.aspx";
var selectCity = "#ddl_city";
var selectTheater = "#ddl_theater";
var enterBtn = "#btn_enter";
var mainSelector = "#aspnetForm";


var dailyObjectArray;
var weeklyMoviesObject;
var theatherInformationObject;
var comingSoonObject;

var finalDaily;
var finalWeekly;
var finalTheatherInfo;
var finalComingSoon;

var dailyObjectArray;
var weeklyArray;

var currentCity;
var currentTheather = {

};
var currentTheatherName;

var complexObject = {

  19: ["11", "12", "13", "14", "15"],
  21: ["16"],
  22: ["17"],
  23: ["18", "19"]
};

var cinesObject = {


};


async.eachOfSeries(complexObject, function(item, keyDo, next) {
    console.log("---> Current city: " + keyDo.toString());
    async.eachOfSeries(item, function(items, keyDos, nexts) {
        console.log("---> Current theather: " + items);
        nightmare
          .goto(urlWeb)
          .wait(selectCity)
          .select(selectCity, keyDo.toString())
          .wait(8000)
          .select(selectTheater, items)
          .wait(1000)
          .click(enterBtn)
          .wait(mainSelector)
          .evaluate(function() {

            //returning HTML for cheerio
            return document.body.innerHTML;
          })
          .then(function(bodyDaily) {
            // Loading HTML body on jquery cheerio
            var $ = cheerio.load(bodyDaily);

            //Object holder for daily information
            dailyObjectArray = [];
            console.log("---> Scraping todays movie");

            var currentTheatherName = $('span[style="font-weight:bold;font-style: italic"]').text();
            var currentCity = $('#contHeaderCity').text().replace("cambiar ciudad >>", "");
            currentCity = currentCity.replace(/\t|\n/g, "").trim();

            //Looping on each div for seccion de Carterla para Hoy
            $('.showtimeDaily').each(function(index, element) {

              //Object holder for daily information
              dailyMoviesObject = {

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
              $($(this).find('li').children()).each(function(i, currentElement) {
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

            finalDaily = {
              daily: dailyObjectArray

            }


            //moving on to weekly page
            nightmare
              .click('a[href*= "../showtimes/weekly.aspx"]')
              .wait(function() {
                return document.readyState === "complete"
              })
              .evaluate(function() {
                return document.body.innerHTML;
              })
              .then(function(bodyWeekly) {
                var tempArray = [];
                weeklyArray = [];
                var $ = cheerio.load(bodyWeekly);
                console.log("---> Scraping weekly");


                $('.showtimeWeekly').each(function(index, element) {

                  //Object holder for weekly information
                  weeklyMoviesObject = {

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

                  $($(this).find('tr')).each(function(i, trElement) {
                    var count = 1;

                    $($(this).find('th')).each(function(k, thElement) {

                      if ($(this).text() != "") {
                        weeklyMoviesObject.weekDaySchedule[$(this).text()] = [];
                      }
                    });

                    $($(this).find('ul')).each(function(l, ulElement) {

                      if ($(this).children().is('li')) {
                        tempArray = [];
                      }

                      $($(this).find('li')).each(function(o, liElement) {
                        tempArray.push($(this).text());
                      });
                      outerLoop:
                        for (var key in weeklyMoviesObject.weekDaySchedule) {
                          if (weeklyMoviesObject.weekDaySchedule[key] == "") {
                            weeklyMoviesObject.weekDaySchedule[key] = tempArray;
                            break outerLoop;
                          }
                        }
                    });

                  });

                  $($(this).find('.showtimeData')).each(function(a, classElement) {
                    if ($(this).children().is('img')) {

                      var tempString = $(this).text().replace(/\t/g, "");
                      tempString = tempString.trim();
                      tempString = tempString.split("\n").filter(String);

                      weeklyMoviesObject.showTimeData = (tempString);
                    }

                  });
                  weeklyArray.push(weeklyMoviesObject);



                  // console.log(weeklyMoviesObject);
                });



                finalWeekly = {
                  weekly: weeklyArray
                }

                //Moving on to cines information page
                nightmare
                  .click('a[href*= "../content/index.aspx?idSection=3"]')
                  .wait(function() {
                    return document.readyState === "complete"
                  })
                  .evaluate(function() {
                    return document.body.innerHTML;
                  })
                  .then(function(cines) {
                    var $ = cheerio.load(cines);
                    var cinesArray = [];
                    console.log("---> Scraping theathers info");
                    if (items == "12") {
                      console.log("---> on bella vista");
                      $('.contentBlock').each(function(index, element) {
                        var count = 0;
                        //Weekely object 
                        theatherInformationObject = {

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


                        for (var key in theatherInformationObject) {

                          theatherInformationObject[key] = tempString[count];
                          count++;

                        }

                        cinesArray.push(theatherInformationObject);


                      });


                    }

                    finalTheatherInfo = {
                      theatherInfo: cinesArray
                    }


                    //nightmare to scrape coming soon info per movies
                    nightmare
                      .click('a[href*= "../showtimes/coming_soon.aspx"]')
                      .wait(function() {
                        return document.readyState === "complete"
                      })
                      .evaluate(function() {

                        return document.body.innerHTML;
                      })
                      .then(function(proximamente) {
                        var $ = cheerio.load(proximamente);
                        var comingSoonArray = [];
                        console.log("---> Scraping comming soon ");

                        $('.comingSoonBlock').each(function(index, element) {

                          //Coming soon info
                          comingSoonObject = {

                              image: "",
                              movieName: "",
                              date: "",

                            }
                            //image for movie
                          comingSoonObject.image = $(this).find('.showtimePic').children('a').children('img').attr('src');

                          //movie Name
                          comingSoonObject.movieName = $(this).find('h3').children('a').text().trim();

                          //Date for premiere
                          comingSoonObject.date = $(this).find('.comingSoonAP').text().trim().replace(/ /g, "").replace("AvantPremiere", "").replace(/\n/g, "");

                          // console.log(comingSoon);

                          comingSoonArray.push(comingSoonObject);

                        });

                        finalComingSoon = {
                          comingSoon: comingSoonArray
                        }

                        //Loop to iterate over each weekly movie and get trailer and movies
                        var countWeek = 0;
                        var weekleySelector;
                        async.eachOfSeries(weeklyArray, function(detailItem, detailKeyDo, detailNext) {

                            if (countWeek >= 10) {
                              weekleySelector = 'a[id = "ctl00_ContentPlaceHolder1_inc_showtime_weekly1_rptPeliculas_ctl' + countWeek + '_lnkTitulo"]';
                            } else {
                              weekleySelector = 'a[id = "ctl00_ContentPlaceHolder1_inc_showtime_weekly1_rptPeliculas_ctl0' + countWeek + '_lnkTitulo"]';

                            }

                            nightmare
                              .click('a[href*= "../showtimes/weekly.aspx"]')
                              .wait(function() {
                                return document.readyState === "complete"
                              })
                              .click(weekleySelector)
                              .wait(function() {
                                return document.readyState === "complete"
                              })
                              .evaluate(function() {
                                return document.body.innerHTML;
                              })
                              .then(function(datailBody) {
                                var $ = cheerio.load(datailBody);
                                console.log("---> Scraping detail daily movie for: " + detailItem.englishTitle);


                                if ($('.showtimeInfo').find('table').children('tbody').children('tr').first().children('td').text() !== undefined || $('.showtimeInfo').find('table').children('tbody').children('tr').first().children('td').text() === "") {
                                  //sinopsis
                                  detailItem.sinopsis = $('.showtimeInfo').find('table').children('tbody').children('tr').first().children('td').text();
                                }

                                nightmare
                                  .wait(function() {
                                    return document.readyState === "complete"
                                  })
                                  .back()
                                  .wait(function() {
                                    return document.readyState === "complete"
                                  })
                                  .then(function() {
                                    countWeek++;
                                    detailNext();
                                  });

                              })
                              .catch(function(error) {
                                console.error('Detail movie error:', error);
                              });

                          },
                          function(err) {
                            if (err) {
                              return console.log(err);
                            } else {

                              //nighmare to go front page to change city
                              nightmare
                                .click('a[href="../index.aspx?c=true"]')
                                .wait(function() {
                                  return document.readyState === "complete"
                                })
                                .evaluate(function() {
                                  return document.body.innerHTML;
                                })
                                .then(function(body) {

                                  console.log('---> Going to IMDB');
                                  //going to IMDB to find movies trailers and sinopsis missing
                                  async.eachOfSeries(weeklyArray, function(weeklyItem, weeklyKey, weeklyNext) {

                                    //console.log(weeklyItem.englishTitle);
                                    if (!(weeklyItem.englishTitle.includes("Dom") || weeklyItem.urlTrailer !== undefined)) {

                                      if (weeklyItem.englishTitle.includes("(2D)")) {
                                        weeklyItem.englishTitle = weeklyItem.englishTitle.replace("(2D)", "");
                                      }
                                      if (weeklyItem.englishTitle.includes("(3D)")) {
                                        weeklyItem.englishTitle = weeklyItem.englishTitle.replace("(3D)", "");
                                      }

                                      if (weeklyItem.englishTitle.includes("SUB")) {
                                        weeklyItem.englishTitle = weeklyItem.englishTitle.replace("SUB", "");
                                      }
                                      if (weeklyItem.englishTitle.includes("(SUB)")) {
                                        weeklyItem.englishTitle = weeklyItem.englishTitle.replace("(SUB)", "");
                                      }
                                      if (weeklyItem.englishTitle.includes("(IMAX)")) {
                                        weeklyItem.englishTitle = weeklyItem.englishTitle.replace("(IMAX)", "");
                                      }

                                      if (weeklyItem.englishTitle.includes("()")) {
                                        weeklyItem.englishTitle = weeklyItem.englishTitle.replace("()", "");
                                      }


                                      nightmare
                                        .goto('http://www.imdb.com')
                                        .wait(function() {
                                          return document.readyState === "complete"
                                        })
                                        .type('#navbar-query', weeklyItem.englishTitle)
                                        .click('#navbar-submit-button')
                                        .wait(function() {
                                          return document.readyState === "complete"
                                        })
                                        .click('ul.findTitleSubfilterList > li:first-of-type > a')
                                        .wait(function() {
                                          return document.readyState === "complete"
                                        })
                                        .click('div > div > div:nth-of-type(2) > table > tbody > tr:first-of-type > td:nth-of-type(2) > a')
                                        .evaluate(function() {
                                          return document.body.innerHTML;

                                        })
                                        .then(function(imdb) {
                                          var $ = cheerio.load(imdb);
                                          weeklyItem.urlTrailer = $('a[itemprop = "trailer"]').attr('href');
                                          weeklyItem.sinopsis = $('.summary_text').text().replace(/\n/g, "").trim();
                                          weeklyNext();

                                        })
                                        .catch(function(error) {
                                          console.error('Errr', error);
                                          weeklyNext();
                                        });

                                    } else {
                                      weeklyNext();
                                    }

                                  }, function(err1) {
                                    if (err1) {
                                      return console.log(err1);
                                    } else {
                                      //Asigning to daily movies information, trailer and sinopsis from weekleys info
                                      for (var cityKey in dailyObjectArray) {
                                        for (var key in weeklyArray) {
                                          if (dailyObjectArray[cityKey].englishTitle.includes(weeklyArray[key].englishTitle)) {
                                            dailyObjectArray[cityKey].sinopsis = weeklyArray[key].sinopsis;
                                            dailyObjectArray[cityKey].urlTrailer = weeklyArray[key].urlTrailer;
                                            break;
                                          }
                                        }

                                      }

                                      console.log(dailyObjectArray);

                                      //END OF SEARCH
                                      console.log('Back to home');
                                      //assigning information to current theather
                                      currentTheather[currentTheatherName] = [finalDaily, finalWeekly, finalTheatherInfo, finalComingSoon];
                                      //passing theather obhect to current city
                                      cinesObject[currentCity] = currentTheather;
                                      console.log(cinesObject);

                                      //executing next theather on loop
                                      nexts();
                                    }
                                  });

                                })
                                .catch(function(error) {
                                  console.error('Search on last nightmare instance, Going back: ', error);
                                });

                            }

                          });

                      }).catch(function(error) {
                        console.error('Error on coming soon :', error);
                      });


                  }).catch(function(error) {
                    console.error('Error on Search cines information :', error);
                  });


              }).catch(function(error) {
                console.error('Error on Search weekly info :', error);
              });

          }).catch(function(error) {
            console.error('Error on searh daily info:', error);

          });


      },
      function(err) {
        if (err) return console.log(err);

        //executing next city on loop
        next();
        //cleaning current theather object to proceed with the other city
        currentTheather = {

        };

      });


  },
  function(err2) {
    //this is the final callback of the final loop
    if (err2) {
      return console.log(err);
    } else {
      console.log("Done with Movies info, moving to IMDB");


      //creating JSON object
      var finalObject = JSON.stringify(cinesObject, null, 4);

      //creating and writing file on directory 
      fs.writeFile('moviesData.json', finalObject, function(err) {
        if (err) {
          return console.log(err);
        } else {
          console.log('File successfully witen! - Check your project directory for the moviesData.json file');
        }

      });

    }

  });