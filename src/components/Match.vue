<template>

  <Team :result="home.result" :name="home.name" :goals="home.goals" :behinds="home.behinds" :points="home.points" /> vs. <Team :result="away.result" :name="away.name" :goals="away.goals" :behinds="away.behinds" :points="away.points" /><br>

</template>

<script>

import Team from "./Team.vue"

export default {
  name: 'Match',
  components: {
    Team
   },
  props: {
    home: Object,
  	away: Object
  }
}
</script>
