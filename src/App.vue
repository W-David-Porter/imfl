<template>
	<nav>
		<span v-for="y in years" @click="updateSeasonData(y)" v-text="y" :key="y"></span>
	</nav>

	<h2>Season {{ season.year }}</h2>

	<Round v-for="r in season.rounds" :key="r.id" :type="r.type" :id="r.id" :matches="r.matches" />

	<hr>

	<h2>Ladder 🪜</h2>
	<Ladder :ladder="season.ladder" />

	<hr>

	<h2>Finals</h2>
	<Round v-for="r in season.finals" :key="r.id" :type="r.type" :id="r.id" :matches="r.matches" />

	<hr>
	<details>
		<summary>⚙️</summary>
		<input type=checkbox id=traitor v-model=traitor @change="updateSeasonData(year)">
		<label for=traitor>Include South Melbourne and Fitzroy (post 1996)</label><br>
	</details>
	


</template>


<script>
	import Round from "./components/Round.vue"
	import Ladder from "./components/Ladder.vue"

	import { getSeasonData, processSeasonData } from "./seasonData"
	import file from "@/assets/2021.csv"
	const year = 2021
	const season = processSeasonData(file, year, false)

	export default {
		methods: {
			async updateSeasonData(year) {
				this.year = year
				this.season = await getSeasonData(year, this.traitor)
			}
		},
		name: "App",
		components: {
			Round,
			Ladder
		},
		data() {
			return {
				year,
				traitor: false,
				season,
				years: Array.from(Array(year - 1982 + 1), (_, y) => y + 1982).reverse()
			}
		},
	}
</script>

<style scoped>
	nav span {
		cursor: pointer;
		white-space: pre
	}

	nav span:hover {
		text-decoration: underline
	}

	nav span:after {
		content: "•";
		padding: 0 .5em;
		text-decoration: none
	}

	nav span:after:hover {
		text-decoration: none
	}

	nav span:last-child:after {
		content: unset
	}

	label {
		margin-left: .5em
	}
</style>