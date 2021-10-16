<template>
	<div class=table-div>
		<table>
			<thead>
				<tr>
					<th scope=col></th>
					<th scope=col>W</th>
					<th scope=col>L</th>
					<th scope=col>D</th>
					<th scope=col>For</th>
					<th scope=col>Agst.</th>
					<th scope=col>Pct.</th>
					<th scope=col>Pts.</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="team in ladder" :key="team.name" >
					<th v-text="team.name" scope=row></th>
					<td v-text="team.win" :title=" `winning ratio: ${ Math.round(((team.win + (team.draw / 2)) / (team.win + team.loss + team.draw) * 100))}  %` "></td>
					<td v-text="team.loss"></td>
					<td v-text="team.draw"></td>
					<td v-text="team.for"></td>
					<td v-text="team.against"></td>
					<td v-text="team.percent.toFixed(1)" :title="team.percent.toFixed(6)"></td>
					<td v-text="team.points"></td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
	export default {
		name: 'Ladder',
		props: {
			ladder: Array
		}
	}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	@media screen and (max-width: 600px) {
		div.table-div {
			word-break: initial;
			overflow-x: scroll;
		}
	}

	table {
		width: unset
	}
	
	thead th,
	td {
		text-align: right
	}

	tr:nth-child(even) {
		background: unset;
	}
	tr:nth-child(5) {
		border-bottom: 5px #ccc double;
	}
</style>