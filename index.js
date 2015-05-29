var request = require('request');
var chalk = require('chalk');
var cheerio = require('cheerio');
var fs = require('fs');
// var _ = require('underscore');
// var queue = require('queue-async');

var top = [];
var data = [];
var urls = [];
var statename = 'WEST BENGAL'

request.post(
    'http://rni.nic.in/display_state.asp',
    { 
      form: { 
              state: statename,
              submit1:'Submit' 
            } 
    },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var $headers = $('th');
            var $rows = $('tr');

            $headers.each(function(index, name){
              var cleanname = $(name).text();
              var check = cleanobj(cleanname);
              top.push(check);
            });
            
            $rows.each(function(index, row){
              var $cells = $(row).find('td');
              var object = {};
              var i = 0;
                $cells.each(function(index,cell){
                  object[top[i]] = $(cell).text();
                  i++;
                });
              i=0;
              var link = 'http://rni.nic.in/' + $($(row).find('a')).attr('href');
              object.link = link;
              object.state = statename
              urls.push(link);
              data.push(object);
              fs.writeFileSync('data/main/'+cleanobj(statename)+'_data.json', JSON.stringify(data));
              fs.writeFileSync('data/urls/'+cleanobj(statename)+'_urls.json', JSON.stringify(urls));
            });
    } else {
          console.log(chalk.red('There was an error'), error, response);
        }
    }
  );

function cleanobj(obj){
  return obj.toLowerCase().replace(/ /g,'').replace(/\./g,'').replace(/\//g,'');
}