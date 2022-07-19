<template>
  <HomePage msg="Cocktail Cabinet" />
</template>

<script>
import HomePage from './components/HomePage.vue';
import BottlePath from './components/BottlePath.vue';
import DrinkPath from './components/DrinkPath.vue';
import ToolsAndTechniques from './components/ToolsAndTechniques.vue';

export default {
  name: 'App',
  components: {
    HomePage,
    BottlePath, //I dont get why it doesnt like these?
    DrinkPath,
    ToolsAndTechniques,
  },
};
</script>

<style lang="scss">
@import 'scss/custom.scss';
@import '~bootstrap/scss/bootstrap.scss';
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;
}
// ...
</style>
