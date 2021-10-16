<template>

	<h3>{{type}} {{id}}</h3>
	<p>
	<Match v-for="m in matches" :key="id" :home="m.home" :away="m.away"  /> 
	</p> 

</template>

<script>
import Match from "./Match.vue"

export default {
  name: 'Round',
  components: {
    Match
   },
  props: {
    type: String,
  	id: Number,
	matches: Array
  }
}


</script>