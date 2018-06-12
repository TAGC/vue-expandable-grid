<template>
  <div id="app">
    <div>
      <md-card>
        <md-card-content class="grid-controls">
          <md-field class="field">
            <label for="cell-size">Cell size</label>
            <md-input type="number" name="cell-size" id="cell-size" v-model.number="cellSize"/>
          </md-field>
          <md-field class="field">
            <label for="cell-regen-rate">Cell regeneration rate</label>
            <md-input type="number" name="cell-regen-rate" id="cell-regen-rate" v-model.number="cellRegenerationRate"/>
          </md-field>
          <md-field class="field">
            <label for="habitability">Habitability</label>
            <md-input type="number" name="habitability" id="habitability" v-model.number="habitability"/>
          </md-field>
        </md-card-content>
      </md-card>
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
import ConwayGrid from "./ConwayGrid.vue";

@Component({ components: { ConwayGrid } })
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
#app {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: 10px;
  height: 100vh;
  width: 100vw;
  position: relative;
}

.grid-controls {
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: 20px;
  align-items: end;
  align-content: start;
}

.field {
  margin-left: 10px;
  margin-bottom: 0px;
}
</style>

