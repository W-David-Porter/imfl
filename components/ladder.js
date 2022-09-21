export default {
	props: {
		rounds: Array
	},

	setup(props) {

		function makeLadder() {
			if (props.rounds.length == 0)
				return []

			const teams = {}

			props.rounds.forEach(r => {
				r.matches.forEach(m => {
					if (!teams[m.homeTeam]) {
						teams[m.homeTeam] = {
							name: m.homeTeam,
							played: 0,
							won: 0,
							lost: 0,
							drawn: 0,
							for: 0,
							against: 0
						}
					}
					if (!teams[m.awayTeam]) {
						teams[m.awayTeam] = {
							name: m.awayTeam,
							played: 0,
							won: 0,
							lost: 0,
							drawn: 0,
							for: 0,
							against: 0
						}
					}
					teams[m.homeTeam].played++
					teams[m.awayTeam].played++

					if (this.homePoints(m) > this.awayPoints(m)) {
						teams[m.homeTeam].won++
						teams[m.awayTeam].lost++
					}
					else if (this.homePoints(m) < this.awayPoints(m)) {
						teams[m.homeTeam].lost++
						teams[m.awayTeam].won++
					}
					else {
						teams[m.homeTeam].drawn++
						teams[m.awayTeam].drawn++
					}

					teams[m.homeTeam].for += this.homePoints(m)
					teams[m.homeTeam].against += this.awayPoints(m)
					teams[m.awayTeam].for += this.awayPoints(m)
					teams[m.awayTeam].against += this.homePoints(m)
				})
			})

			const ret = Object.keys(teams).map(t => teams[t])

			ret.sort(function (a, b) {
				if ((a.won * 4) + (a.drawn * 2) > (b.won * 4) + (b.drawn * 2))
					return -1
				else if ((a.won * 4) + (a.drawn * 2) < (b.won * 4) + (b.drawn * 2))
					return 1
				else if (a.played < b.played)
					return -1
				else if (a.played > b.played)
					return 1
				else if (a.for / a.against > b.for / b.against)
					return -1
				else if (a.for / a.against < b.for / b.against)
					return 1
				else
					return a.name > b.name ? -1 : 1
			})


			return ret

		}

		return {
			makeLadder
		}


	},
	methods: {
		homePoints(m) { return m.homeGoals * 6 + m.homeBehinds },
		awayPoints(m) { return m.awayGoals * 6 + m.awayBehinds },
	},
	template: `
<div style="overflow-x: auto;">
	<table>
		<thead>
			<tr>
				<th scope=col>Club</th>
				<th class=right scope=col>Played</th>
				<th class=right scope=col>Won</th>
				<th class=right scope=col>Lost</th>
				<th class=right scope=col>Drawn</th>
				<th class=right scope=col>For</th>
				<th class=right scope=col>Against</th>
				<th class=right scope=col>%</th>
				<th class=right scope=col>Points</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="t in makeLadder()">
				<th scope=row>{{ t.name }}</th>
				<td class=right>{{ t.played }}</td>
				<td class=right>{{ t.won }}</td>
				<td class=right>{{ t.lost }}</td>
				<td class=right>{{ t.drawn }}</td>
				<td class=right>{{t.for }}</td>
				<td class=right>{{t.against }}</td>
				<td class=right>{{ (t.for / t.against * 100).toFixed(1) }}</td>
				<td class=right>{{ t.won * 4 + t.drawn * 2 }}</td>
			</tr>
		</tbody>
		</table>
</div>
`
}
