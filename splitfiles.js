const fs = require('fs');
const util = require("util");
var contents = fs.readFileSync('allyears.csv', 'utf8');

var Papa = require('papaparse');

//var results = Papa.parse(contents, {header: true});
var results = Papa.parse(contents, {skipEmptyLines: true});


var currentYear = "1982";
var headerRow = "year,roundType,roundNumber,homeTeam,homeGoals,homeBehinds,awayTeam,awayGoals,awayBehinds";
const outdir = "yeardata2"
if (!fs.existsSync(outdir)){
    fs.mkdirSync(outdir);
}
var toWrite = [headerRow]; 
results.data.forEach(function(d) { 
	console.log(d);	

	if (d[0] != currentYear) {
		// close the old file, and create a new year
		fs.writeFileSync(`./${outdir}/${currentYear}.csv`, toWrite.join("\n"));
		toWrite = [headerRow];
		currentYear = d[0];
	}

	// fix the line
if (typeof d[1] == undefined) 
	debugger
	
	let split = d[1].split(" ")
	d.splice(2, 0, split[0].toLowerCase())
	d.splice(3, 0, split[split.length-1])
	d.splice(1, 1)

	//write the line
	toWrite.push(d.join());

});

//close the last file
fs.writeFileSync(`./${outdir}/${currentYear}.csv`, toWrite.join("\n"));



