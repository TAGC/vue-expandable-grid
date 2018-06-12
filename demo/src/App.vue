<template>
  <div id="app">
    <ConwayGrid :minExtent="minGridExtent" />
  </div>
</template>

<script lang="ts">
import { Extent } from "@/.";
import Vue from "vue";
import { Component } from "vue-property-decorator";
import ConwayGrid from "./ConwayGrid.vue";

@Component({ components: { ConwayGrid } })
export default class App extends Vue {

  private get minGridExtent(): Extent {
    return new Extent(-200, -200, 400, 400);
  }
}
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

