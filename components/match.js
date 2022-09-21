import { computed } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js" 

export default {

	setup(props) {
		const homePoints = computed(() => props.scores.homeGoals * 6 + props.scores.homeBehinds)
		const awayPoints = computed(() => props.scores.awayGoals * 6 + props.scores.awayBehinds)

		return {
			homePoints,
			awayPoints
		}
	},
	props: {
		scores: Object
	},
	template: `
		<span :class="{italic: homePoints == awayPoints}">
			<span :class="{bold: homePoints > awayPoints}">{{ scores.homeTeam }} {{ scores.homeGoals }}.{{ scores.homeBehinds }}.{{ homePoints }}</span> 
			vs. 
			<span :class="{bold: awayPoints > homePoints}">{{ scores.awayTeam }} {{ scores.awayGoals }}.{{ scores.awayBehinds }}.{{ awayPoints }}</span> 
		</span>
	`
}

