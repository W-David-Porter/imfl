const fs = require('fs');
const util = require("util");
var contents = fs.readFileSync('allyears.csv', 'utf8');

var Papa = require('papaparse');

//var results = Papa.parse(contents, {header: true});
var results = Papa.parse(contents);


var currentYear = "1982";
var headerRow = "year,round,homeTeam,homeGoals,homeBehinds,awayTeam,awayGoals,awayBehinds";
var toWrite = [headerRow]; 
results.data.forEach(function(d) { 
	console.log(d);	

	if (d[0] != currentYear) {
		// close the old file, and create a new year
		fs.writeFileSync(util.format("./yeardata/%d.csv", currentYear), toWrite.join("\n"));
		toWrite = [headerRow];
		currentYear = d[0];
	}

	//write the line
	toWrite.push(d.join());

});

//close the last file
fs.writeFileSync(util.format("./yeardata/%d.csv", currentYear), toWrite.join("\n"));



