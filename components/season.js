import Round from "./round.js"
import Ladder from "./ladder.js"

export default {
	components: {
		Round,
		Ladder
	},
	props: {
		season: Object
	},
	template: `
		<h2>Season {{ season.year }}</h2>
		<div v-for="round in season.rounds">
			<Round :round="round" :finals="0"></Round>
		</div>

		<div>
			<h2>Ladder</h2>
			<Ladder :rounds="season.rounds"></Ladder>

		</div>

		<h2 v-if="season.finals.length > 0">Finals</h2>
		<div v-for="(round, i) in season.finals">
			<Round :round="round" :finals="i+1"></Round>
		</div>
		`

}
