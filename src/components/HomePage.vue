<template>
  <div class="alt-background">
    <h1>{{ msg }}</h1>
    <h4>building your cocktail bar one bottle at a time</h4>
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
