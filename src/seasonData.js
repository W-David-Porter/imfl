

export async function getSeasonData(year, traitor = false) {
	let ret = ""
	await fetch(`data/${year}.csv`)
		.then(response => response.text())
		.then(csv => ret = processSeasonData(csv, year, traitor))

	return ret || "nope"
}

import Papa from "papaparse"

// returns a season object:
export function processSeasonData(csv, year, traitor) {

	// prepare our return object
	const ret = {
		year,
		ladder: [],
		rounds: [],
		finals: []
	}

	// process data through papa parse
	const parsed = Papa.parse(csv, { dynamicTyping: true, skipEmptyLines: true, header: true })

	// use only the rounds (for starters)
	let roundData = parsed.data.filter(d => d.roundType == "round")
	if (!traitor) {
		roundData = roundData.filter(d => d.homeTeam != "South Melbourne" && d.awayTeam != "South Melbourne")
		if (year > 1996) {
			roundData = roundData.filter(d => d.homeTeam != "Fitzroy" && d.awayTeam != "Fitzroy" )
		}
	}

	// group all matches by round number, and make a 
	const teamNames = new Set()
	const rounds = new Map()
	roundData.forEach(r => {
		if (!rounds.has(r.roundNumber)) {
			rounds.set(r.roundNumber, [])
		}

		rounds.get(r.roundNumber).push(r)
		teamNames.add(r.homeTeam)
	})

	// prepare ladder
	ret.ladder = [...teamNames].map(t => {
		return {
			name: t,
			win: 0,
			loss: 0,
			draw: 0,
			for: 0,
			against: 0,
			points: 0,
			percent: 0
		}
	})

	// for each round, create a round object
	// and as we go, populate ladder
	for (let [roundNumber, roundData] of rounds) {
		const round = {
			type: "Round",
			id: roundNumber,
			matches: roundData.map((d, id) => {
				const homePoints = d.homeGoals * 6 + d.homeBehinds
				const awayPoints = d.awayGoals * 6 + d.awayBehinds

				// update ladder
				// home team
				let myHomeTeam = ret.ladder.find(l => l.name == d.homeTeam)
				myHomeTeam.for += homePoints
				myHomeTeam.against += awayPoints
				let myAwayTeam = ret.ladder.find(l => l.name == d.awayTeam)
				myAwayTeam.for += awayPoints
				myAwayTeam.against += homePoints
				if (homePoints > awayPoints) {
					myHomeTeam.win++
					myAwayTeam.loss++
				}
				else if (homePoints < awayPoints) {
					myHomeTeam.loss++
					myAwayTeam.win++
				}
				else {
					myHomeTeam.draw++
					myAwayTeam.draw++
				}

				// return our match object
				return {
					id,
					home: {
						name: d.homeTeam,
						goals: d.homeGoals,
						behinds: d.homeBehinds,
						points: homePoints,
						result: homePoints > awayPoints ? "win" : (homePoints == awayPoints ? "draw" : "loss")
					},
					away: {
						name: d.awayTeam,
						goals: d.awayGoals,
						behinds: d.awayBehinds,
						points: awayPoints,
						result: awayPoints > homePoints ? "win" : (homePoints == awayPoints ? "draw" : "loss")
					}
				}
			})
		}
		ret.rounds.push(round)
	}

	// calculate ladder values
	ret.ladder.forEach(l => {
		l.points = l.win * 4 + l.draw * 2
		l.percent = l.for / l.against * 100.0
	})
	ret.ladder.sort(function (a, b) {
		if (a.points == b.points)
			return b.percent - a.percent
		else
			return b.points - a.points
	})

	// do it again for our finals
	let finalsData = parsed.data.filter(d => d.roundType == "finals")
	if (!traitor) {
		finalsData = finalsData.filter(d => d.homeTeam != "Fitzroy" && d.homeTeam != "South Melbourne" && d.awayTeam != "Fitzroy" && d.awayTeam != "South Melbourne")
	}

	// group all finals matches by week number, and make a 
	const finals = new Map()
	finalsData.forEach(r => {
		if (!finals.has(r.roundNumber)) {
			finals.set(r.roundNumber, [])
		}
		finals.get(r.roundNumber).push(r)
	})
	// for each finals round, create a round object
	let counter = 0
	for (let [roundNumber, roundData] of finals) {
		++counter
		const round = {
			type: "Week",
			id: counter,
			matches: roundData.map((d, id) => {
				const homePoints = d.homeGoals * 6 + d.homeBehinds
				const awayPoints = d.awayGoals * 6 + d.awayBehinds
				// return our match object
				return {
					id,
					home: {
						name: d.homeTeam,
						goals: d.homeGoals,
						behinds: d.homeBehinds,
						points: homePoints,
						result: homePoints > awayPoints ? "win" : (homePoints == awayPoints ? "draw" : "loss")
					},
					away: {
						name: d.awayTeam,
						goals: d.awayGoals,
						behinds: d.awayBehinds,
						points: awayPoints,
						result: awayPoints > homePoints ? "win" : (homePoints == awayPoints ? "draw" : "loss")
					}
				}
			})
		}
		ret.finals.push(round)
	}

	return ret
}




