<template>
  <div id="app">
    <Grid />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import Grid from "./components/Grid.vue";

@Component({ components: { Grid } })
export default class App extends Vue {}
</script>

<style lang="scss" scoped>
#app {
  display: grid;
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
}
</style>

<style>
body {
  margin: 0;
}
</style>

