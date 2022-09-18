export default {
	props: {
		scores: Object
	},
	computed: {
		homePoints() { return this.scores.homeGoals * 6 + this.scores.homeBehinds },
		awayPoints() { return this.scores.awayGoals * 6 + this.scores.awayBehinds }
	},
	template: `
		<span :class="{italic: homePoints == awayPoints}"><span :class="{bold: homePoints > awayPoints}">{{ scores.homeTeam }} {{ scores.homeGoals }}.{{ scores.homeBehinds }}.{{ homePoints }}</span> vs. <span :class="{bold: awayPoints > homePoints}">{{ scores.awayTeam }} {{ scores.awayGoals }}.{{ scores.awayBehinds }}.{{ awayPoints }}</span> </span>
	`
}

