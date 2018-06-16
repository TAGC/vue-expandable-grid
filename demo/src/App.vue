<template>
  <div id="app">
    <div class="controls md-card-content">
      We can use vue-expandable-grid to create an indefinitely-large Conway's Game of Life.
      <br />
      Try setting the cell size to <Control v-model="cellSize" :width="40" /> px.
    </div>
    <ConwayGrid
      :minExtent="minGridExtent"
      :cellSize="cellSize"
      :cellRegenerationRate="cellRegenerationRate"
      :habitability="habitability"
    />
  </div>
</template>

<script lang="ts">
import { Extent } from "@/.";
import Vue from "vue";
import { Component } from "vue-property-decorator";
import Control from "./Control.vue";
import ConwayGrid from "./ConwayGrid.vue";

@Component({ components: { ConwayGrid, Control } })
export default class App extends Vue {
  private cellSize = 50;
  private cellRegenerationRate = 1000;
  private habitability = 0.25;

  private get minGridExtent(): Extent {
    return new Extent(-200, -200, 400, 400);
  }
}
</script>

<style lang="scss" scoped>
@import "variables";

#app {
  display: grid;
  height: 100vh;
  width: 100vw;
  position: relative;
}

.controls {
  font-size: $font-size;
  position: absolute;
  left: 20px;
  top: 20px;
  width: 40vw;
  z-index: 1;
  background: white;
  border-radius: 5px;
  border: 2px solid black;
}
</style>

