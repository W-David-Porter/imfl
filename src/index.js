import "./style.css"
import Vue from "vue"
import Papa from "papaparse";

////////////////////////////////////////////////
// define our functions
const loadSeason = async (year) => {

	if (!seasonsCache[year]) {
		seasonsCache[year] = {}

		await fetch(`yeardata/${year}.csv`)
			.then(response => response.text())
			.then(csv => {
				const results = Papa.parse(csv, {
					header: true,
					skipEmptyLines: true,
				})
				seasonsCache[year].json = results.data
			})
	}

	var season = processSeason(seasonsCache[year].json)
	seasonsCache[year].rounds = season.rounds
	seasonsCache[year].finals = season.finals
	seasonsCache[year].ladder = season.ladder

}

const processSeason = data => {
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

const getPoints = (goals, behinds) => (parseInt(goals) * 6) + parseInt(behinds)

const createRound = (currentRound, roundNumber) => {

	const newRound = {
		id: roundNumber,
		type: currentRound[0].roundType,
		matches: []
	}

	// iterate matches
	currentRound.forEach(row => {

		if (!store.traitor)
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
}



///////////////////////////////////////////////
// define some needed constants
const BASE_YEAR = 1982
const NOW_YEAR = new Date().getFullYear()
const seasonsCache = {
	//e.g. "1982": {json: "", rounds: [], finals: [], ladder: [] }
}


///////////////////////////////////////////////
// execution starts here

// this will go into our vue instance
const store = {
	traitor: window.localStorage.getItem("traitor") == "true"
}

// get our range of years
store.yearRange = Array.from(Array(NOW_YEAR - BASE_YEAR + 1), (_, year) => year + BASE_YEAR).reverse()

// find out what year we are viewing
store.currentYear = NOW_YEAR
if (location.hash.length > 1) {
	const num = parseInt(location.hash.substring(1))
	if (!isNaN(num) && num >= BASE_YEAR && num <= NOW_YEAR)
		store.currentYear = num
}
document.title = `Inner Melbourne Football League | ${store.currentYear}`


//load our initial year's data
await loadSeason(store.currentYear)
if (seasonsCache[store.currentYear].rounds.length == 0) {
	--store.currentYear // and try again
	store.yearRange.shift()
	await loadSeason(store.currentYear)
}

store.rounds = seasonsCache[store.currentYear].rounds
store.finals = seasonsCache[store.currentYear].finals
store.ladder = seasonsCache[store.currentYear].ladder


///////////////////////////////////////////
// create our vue components
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


////////////////////////////////////////////
// create our vue instance

const app = new Vue({
	el: "#app",
	data: store,
	methods: {
		onTraitorChange: async function (evt) {
			window.localStorage.setItem("traitor", this.traitor)
			for (const year of Object.getOwnPropertyNames(seasonsCache)) {
				delete seasonsCache[year];
			}
			await loadSeason(this.currentYear)
			store.rounds = seasonsCache[store.currentYear].rounds
			store.finals = seasonsCache[store.currentYear].finals
			store.ladder = seasonsCache[store.currentYear].ladder
		},
		onYearChange: async function (evt) {
			document.title = `Inner Melbourne Football League | ${this.currentYear}`
			await loadSeason(this.currentYear)
			store.rounds = seasonsCache[store.currentYear].rounds
			store.finals = seasonsCache[store.currentYear].finals
			store.ladder = seasonsCache[store.currentYear].ladder
		}
	}
})


