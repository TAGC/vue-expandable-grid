<template>
  <div @click="regenerateCells">
    <ExpandableGrid v-show="showGrid" :tileSize="100" :minExtent="minExtent" @grid-resized="onGridResized">
      <Cell slot="grid-tile" slot-scope="{data}" :props="data" :alive="isAlive({data})"/>
      <!-- <DebugTile slot="grid-tile" slot-scope="{data}" :props="data" :debug="`${data.column}.${data.row}`" /> -->
    </ExpandableGrid>
  </div>
</template>

<script lang="ts">
import * as _ from "lodash";

import ExpandableGrid, { DebugTile, Extent, IGridResizeEventArgs, ITile } from "@/.";
import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import ConwayGrid, { GridDimensions } from "../ConwayGrid";
import Cell from "./Cell.vue";

@Component({ components: { ExpandableGrid, Cell, DebugTile } })
export default class Grid extends Vue {
  private static readonly cellRegenerationRate = 1000;
  private conwayGrid = new ConwayGrid(new GridDimensions(0, 0, 0, 0));

  // Data
  private showGrid = true;

  public mounted() {
    setInterval(() => this.regenerateCells(), Grid.cellRegenerationRate);

    // Temporary.
    _.delay(() => this.conwayGrid.spawnRandomCells(), 10);
  }

  private get minExtent(): Extent {
    return new Extent(-2000, -2000, 4000, 4000);
  }

  private isAlive({data}: ITile): boolean {
    const { row, column } = data;

    return this.conwayGrid.liveCellAt(row, column);
  }

  private regenerateCells() {
    console.time("Next generation");
    this.conwayGrid.nextGeneration();
    console.timeEnd("Next generation");
    this.refreshGrid();
  }

  private refreshGrid() {
    this.showGrid = false;

    Vue.nextTick(() => {
      this.showGrid = true;
    });
  }

  private onGridResized(e: IGridResizeEventArgs) {
    console.log("Grid resized", e);
    this.conwayGrid.resize(e);
  }
}
</script>

