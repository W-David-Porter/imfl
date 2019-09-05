const fs = require('fs');
var contents = fs.readFileSync('allyears.csv', 'utf8');

var Papa = require('papaparse');

//var results = Papa.parse(contents, {header: true});
var results = Papa.parse(contents);


var currentYear = "1982";
var toWrite = []; 
results.data.forEach(function(d) { 
	console.log(d);	

	if (d[0] != currentYear) {
		// close the old file, and create a new year
		fs.writeFileSync(d[0] + ".csv.txt", toWrite.join("\n"));
		toWrite = [];
		currentYear = d[0];
	}

	//write the line
	toWrite.push(d.join());

});

