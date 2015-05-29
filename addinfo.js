var request = require('request');
var chalk = require('chalk');
var cheerio = require('cheerio');
var fs = require('fs');
var _ = require('underscore');
var queue = require('queue-async');

var urls = require('./data/urls/combinedurls')

var addn = [];

function cleanobj(obj){
  return obj.toLowerCase().replace(/ /g,'').replace(/\./g,'').replace(/\//g,'');
}

_.rateLimit = function(func, rate, async) {
  var queue = [];
  var timeOutRef = false;
  var currentlyEmptyingQueue = false;
  
  var emptyQueue = function() {
    if (queue.length) {
      currentlyEmptyingQueue = true;
      _.delay(function() {
        if (async) {
          _.defer(function() { queue.shift().call(); });
        } else {
          queue.shift().call();
        }
        emptyQueue();
      }, rate);
    } else {
      currentlyEmptyingQueue = false;
    }
  };
  
  return function() {
    var args = _.map(arguments, function(e) { return e; }); // get arguments into an array
    queue.push( _.bind.apply(this, [func, this].concat(args)) ); // call apply so that we can pass in arguments as parameters as opposed to an array
    if (!currentlyEmptyingQueue) { emptyQueue(); }
  };
};

// The number to queue is how many requests it can handle in parallel 
// If only want one to start after the previous request has finished, set this to `1`.
var q = queue(25);

// Make a rate limited version of our requesting function, this will only call it once every 5 seconds
// but unlike throttle or debounce, it will put our requests into a line up so it will always execute every function given to it.
var makeRequest_limited = _.rateLimit(makeRequest, 50)

urls.forEach(function(url){
  // Add each request to the main queue
  q.defer(makeRequest_limited, url);
});

// The function we do when we're all done
q.awaitAll(function(err, bodies){
  console.log(chalk.green('All done!'));
  console.log(bodies.length, 'pages available');
  fs.writeFileSync('addninfofull.json', JSON.stringify(addn));
});

function makeRequest(url, cb){
  // You could delay each request but wrapping it in a setTimeout, but using the rateLimit extension above is a nicer solution
  // setTimeout(function(){
    console.log(chalk.cyan('Requesting...'), url);

    request(url, function(err, response, body){
      if (!err && response.statusCode == 200){
        var $ = cheerio.load(body);
        var $rows = $('tr');
        var variable = {};
        $rows.each(function(index, row){
              var $cellone = $($(row).find('td')[0]);
              var $celltwo = $($(row).find('td')[1]);
              var name = $cellone.text();
              variable[name]=$celltwo.text();
        });
        addn.push(variable);
        cb(null, body);
      } else {
        cb(err);
      }
    });

  // }, 5000)
}