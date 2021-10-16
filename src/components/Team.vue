<template>
	<span :class="result">
		{{name}} {{goals}}.{{behinds}}.{{points}}
	</span>
</template>

<script>
export default {
  name: 'Team',
  props: {
    result: String,
	name: String,
	goals: Number,
	behinds: Number,
	points: Number,
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
span.win { 
	font-weight: bold
}
span.draw { 
	font-style: italic
}
</style>
