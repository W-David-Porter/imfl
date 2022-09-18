
import Match from "./match.js"

export default {
	components: {
		Match
	},
	props: {
		round: Object,
		finals: Number
	},
	template: `
	<h3 v-if="!finals">Round {{ round.roundNumber }}</h3>
	<h3 v-else>Week {{ finals }} <span v-if="round.matches.length==0">— bye</span></h3>
	<ul>
		<li v-for="match in round.matches"><Match :scores="match"></Match></li>
	</ul>
	`

}
