<template>
  <h1>Bottle Path homie</h1>
  <input type="text" v-model="input" placeholder="search some alcohol..." />
</template>

<script>
import * as data from '../assets/recipes';
console.log(data.liquors);
export default {
  name: 'BottlePath',
};
</script>

<style scoped lang="scss">
h4 {
  margin: 40px 0 0;
  font-family: monospace, 'Courier New', Courier;
}
</style>
