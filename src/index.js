import './style.css';
import Vue from "vue"
import Papa from "papaparse";

// the year we use 
const getYear = () => {

	// get the current year
	let year = 0

	// get a hash, use that instead
	let hash = window.location.hash
	if (hash.startsWith("#"))
		hash = hash.substring(1)

	year = Number(hash)
	if (isNaN(year) || year < baseYear || year > thisYear) {
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
		type: currentRound[0].roundType,
		matches: []
	}

	// iterate matches
	currentRound.forEach(row => {

		if (!app.traitor)
			if (row.homeTeam == "Fitzroy" || row.awayTeam == "Fitzroy"
				|| row.homeTeam == "South Melbourne" || row.awayTeam == "South Melbourne")
				return

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

const createLadder = (season) => {

	var weeklyLadder = {}
	season.forEach(round => {
		round.matches.forEach(match => {
			if (!weeklyLadder[match.homeTeam.name]) {
				weeklyLadder[match.homeTeam.name] = {
					name: match.homeTeam.name, win: 0, loss: 0, draw: 0, for: 0, against: 0,
					get percent() { return this.for / this.against * 100 },
					get points() { return (this.win * 4) + (this.draw * 2) }
				}
			}
			if (!weeklyLadder[match.awayTeam.name]) {
				weeklyLadder[match.awayTeam.name] = {
					name: match.awayTeam.name, win: 0, loss: 0, draw: 0, for: 0, against: 0,
					get percent() { return this.for / this.against * 100 },
					get points() { return (this.win * 4) + (this.draw * 2) }
				}
			}

			// fors and againsts
			weeklyLadder[match.homeTeam.name].for += match.homeTeam.points;
			weeklyLadder[match.homeTeam.name].against += match.awayTeam.points;
			weeklyLadder[match.awayTeam.name].for += match.awayTeam.points;
			weeklyLadder[match.awayTeam.name].against += match.homeTeam.points;

			// win loss draw
			if (match.homeTeam.result == "win")
				weeklyLadder[match.homeTeam.name].win++
			if (match.awayTeam.result == "win")
				weeklyLadder[match.awayTeam.name].win++
			if (match.homeTeam.result == "loss")
				weeklyLadder[match.homeTeam.name].loss++
			if (match.awayTeam.result == "loss")
				weeklyLadder[match.awayTeam.name].loss++
			if (match.homeTeam.result == "draw")
				weeklyLadder[match.homeTeam.name].draw++
			if (match.awayTeam.result == "draw")
				weeklyLadder[match.awayTeam.name].draw++

		})
	})

	return weeklyLadder

};


const loadSeason = async (year) => {

	if (!fetchedCsv[year]) {

		await fetch(`yeardata/${year}.csv`)
			.then(response => response.text())
			.then(csv => {
				const results = Papa.parse(csv, {
					header: true,
					skipEmptyLines: true,
				})
				fetchedCsv[year] = results.data
			})
	}

	if (!parsedJson[year])
		parsedJson[year] = processSeason(fetchedCsv[year])
	return parsedJson[year]
}

const processSeason = function (data) {
	// first group them by roundNumber
	const roundsData = {}
	const finalsData = {}
	data.forEach(row => {
		if (row.roundType == "round") {
			if (!roundsData[row.roundNumber]) {
				roundsData[row.roundNumber] = []
			}
			roundsData[row.roundNumber].push(row)
		}
		else if (row.roundType == "finals") {
			if (!finalsData[row.roundNumber]) {
				finalsData[row.roundNumber] = []
			}
			finalsData[row.roundNumber].push(row)
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
	let finals = []
	for (let roundNumber in finalsData) {
		const currentRound = finalsData[roundNumber]
		finals.push(createRound(currentRound, roundNumber))
	}
	//sometimes some finals weeks have no games, so we need to adjust the id
	finals = finals.filter(round => {
		return round.matches.length > 0
	})
	finals.forEach((round, i) => {
		round.id = i + 1
	})

	// create a ladder out of our season
	const objLadder = createLadder(season)
	const ladder = Object.values(objLadder)
	ladder.sort((a, b) => {
		if (a.points == b.points)
			return b.percent - a.percent
		else
			return b.points - a.points
	})


	// apply to our vue app
	return {
		rounds: season,
		finals,
		ladder
	}
}

//todo can we not declare these, either pass them around or put them on vue?
const baseYear = 1982
const thisYear = new Date().getFullYear()

// these are our stores, 
const fetchedCsv = {}
const parsedJson = {} //it gets reset onTraitorChange


//register components
Vue.component("team", {
	props: ["score"],
	template: "#team-template"
});


Vue.component('round', {
	props: ["round"],
	template: "#round-template"
});

Vue.component('ladder', {
	props: ["ladder"],
	template: "#ladder-template"
});


const app = new Vue({
	el: "#app",
	data: {
		years: getYearRange(thisYear).reverse(), // to populate the select box
		year: getYear(), // current year we are looking at
		season: { rounds: [], finals: [], ladder: [] },
		traitor: window.localStorage.getItem("traitor") == "true"
	},
	methods: {
		onTraitorChange: async function (evt) {
			window.localStorage.setItem("traitor", this.traitor)
			for (const year of Object.getOwnPropertyNames(parsedJson)) {
				delete parsedJson[year];
			}
			this.season = await loadSeason(this.year)
		},
		onYearChange: async function (evt) {
			document.title = `Inner Melbourne Football League | ${this.year}`
			this.season = await loadSeason(this.year)
		}
	},
	mounted: async function () {
		document.title = `Inner Melbourne Football League | ${this.year}`
		this.season = await loadSeason(this.year)
	}
})


