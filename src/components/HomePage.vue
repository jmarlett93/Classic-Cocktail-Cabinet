<template>
  <div class="alt-background">
    <h1>{{ msg }}</h1>
    <h4>building your cocktail bar one bottle at a time</h4>
  </div>
  <div class="container">
    <div class="d-inline-flex flex-md-row flex-column">
      <button type="button" to="/by-the-bottle" class="btn btn-outline-primary m-2">John</button>
      <button type="button" to="/from-the-drink" class="btn btn-outline-primary m-2">Is</button>
      <button type="button" to="/tools-and-techniques" class="btn btn-outline-primary m-2">Gay</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  props: {
    msg: String,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h4 {
  margin: 40px 0 0;
  font-family: monospace, 'Courier New', Courier;
}
</style>
