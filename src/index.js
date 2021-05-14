import Vue from "vue"
import Papa from "papaparse";

const thisYear = new Date().getFullYear()
const baseYear = 1987



const getYear = () => {

	// get the current year
	let year = 0

	// get a hash, use that instead
	let hash = /* typeof window == "undefined" ? thisYear :*/ window.location.hash
	if (hash.startsWith("#"))
		hash = hash.substring(1)

	year = Number(hash)
	if (year < baseYear || year > thisYear) {
		year = thisYear
	}
	return year
};

const getYearRange = () => {
	const span = thisYear - baseYear
	const ret = Array.from({ length: span + 1 }, (x, i) => i + baseYear);
	return ret
};

const getPoints = (goals, behinds) => {
	return (parseInt(goals) * 6) + parseInt(behinds)
}

const createRound = (currentRound, roundNumber) => {

	const newRound = {
		id: roundNumber,
		matches: []
	}

	// iterate matches
	currentRound.forEach((row) => {
		const match = {
			homeTeam: { name: row.homeTeam, goals: row.homeGoals, behinds: row.homeBehinds, points: getPoints(row.homeGoals, row.homeBehinds) },
			awayTeam: { name: row.awayTeam, goals: row.awayGoals, behinds: row.awayBehinds, points: getPoints(row.awayGoals, row.awayBehinds) }
		}
		if (match.homeTeam.points > match.awayTeam.points) {
			match.homeTeam.result = "win";
			match.awayTeam.result = "loss"
		}
		else if (match.homeTeam.points < match.awayTeam.points) {
			match.homeTeam.result = "loss";
			match.awayTeam.result = "win"
		}
		else {
			match.homeTeam.result = "draw";
			match.awayTeam.result = "draw"
		}
		newRound.matches.push(match)
	})

	return newRound

}

const loadSeason = (year) => {
	Papa.parse(`yeardata/${year}.csv`, {
		download: true,
		header: true,
		skipEmptyLines: true,
		complete: function (results) {

			// first group them by roundNumber
			const roundsData = {}
			const finalsData = {}
			results.data.forEach(row => {
				if (row.roundType == "finals") {
					if (!finalsData[row.roundNumber]) {
						finalsData[row.roundNumber] = []
					}
					finalsData[row.roundNumber].push(row)
				}
				else if (row.roundType == "round") {
					if (!roundsData[row.roundNumber]) {
						roundsData[row.roundNumber] = []
					}
					roundsData[row.roundNumber].push(row)
				}
				else {
					throw new Error("unexpected round type", row.roundType)
				}
			})

			// iterate the grouped data row to make each round
			const season = []
			for (let roundNumber in roundsData) {
				const currentRound = roundsData[roundNumber]
				season.push(createRound(currentRound, roundNumber))
			}
			const finalsSeason = []
			for (let roundNumber in finalsData) {
				const currentRound = finalsData[roundNumber]
				finalsSeason.push(createRound(currentRound, roundNumber))
			}

			// save to our cached seasons
			seasons[year] = season
			finalsSeasons[year] = finalsSeason
			// apply to our vue app
			window.myApp.season = season
			window.myApp.finals = finalsSeason
		}
	});
}

const loadApp = (newValue, oldValue) => {

	if (oldValue) {
		// keep a copy in the cache
		if (!seasons[oldValue]) {
			seasons[oldValue] = window.myApp.season
			finalsSeasons[oldValue] = window.myApp.finals
		}
	}

	if (seasons[newValue]) {
		window.myApp.season = seasons[newValue]
		window.myApp.finals = finalsSeasons[newValue]
	}
	else {
		loadSeason(newValue)
	}
};


const year = getYear()
const years = getYearRange(year).reverse()
const seasons = {}
const finalsSeasons = {}


Vue.component("team", {
	props: ["score"],
	template: "#team-template"
});

Vue.component('match', {
	props: ["match"],
	template: "#match-template"
});

Vue.component('round', {
	props: ["round"],
	template: "#round-template"
});


window.myApp = new Vue({
	el: "#app",
	data: {
		years: years,
		year: year,
		season: [],
		finals: []
	},
	watch: {
		year: (newValue, oldValue) => {
			window.location.hash = newValue
			loadApp(newValue, oldValue)
		}
	},
	mounted: () => {
		loadApp(year)
	}
})

