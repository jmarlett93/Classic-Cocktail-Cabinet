<template>
  <h1>Bottle Path homie</h1>
  <button type="button" @click="logShit()"></button>
  <!--
  <select v-model="selected" multiple @change="callSearch(selected)">
    <option value="Option 1">Option 1</option>
    <option v-for="(result, index) in results" v-bind:key="index">{{ result }}</option>
    ...
  </select>-->
</template>

<script>
export default {
  name: 'BottlePath',
  props: {
    selected: String,
    results: Array,
  },
  methods: {
    logShit() {
      console.log('shit');
    },
    // callSearch(value) {
    //  return (filteredResults = search(value, data.liqours, { keySelector: (obj) => obj.name }));
    //   },
  },
};
</script>

<style scoped lang="scss">
h4 {
  margin: 40px 0 0;
  font-family: monospace, 'Courier New', Courier;
}
</style>
