<template>
  <div @click="regenerateCells">
    <ExpandableGrid v-show="showGrid" :tileSize="100" :minExtent="minExtent">
      <Cell slot="grid-tile" slot-scope="{data}" :props="data" :alive="isAlive({data})"/>
      <!-- <DebugTile slot="grid-tile" slot-scope="{data}" :props="data" :debug="`${data.column}.${data.row}`" /> -->
    </ExpandableGrid>
  </div>
</template>

<script lang="ts">
import ExpandableGrid, { DebugTile, Extent, ITile } from "@/.";
import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import ConwayGrid, { GridDimensions } from "../ConwayGrid";
import Cell from "./Cell.vue";

@Component({ components: { ExpandableGrid, Cell, DebugTile } })
export default class Grid extends Vue {
  private static readonly cellRegenerationRate = 1000;
  private conwayGrid: ConwayGrid;

  // Data
  private minColumn = 0;
  private maxColumn = 0;
  private minRow = 0;
  private maxRow = 0;
  private showGrid = true;

  public mounted() {
    this.conwayGrid = new ConwayGrid(this.conwayGridDimensions);
    this.onConwayGridDimensionsChanged(this.conwayGridDimensions);
    setInterval(() => this.regenerateCells(), Grid.cellRegenerationRate);
  }

  private get conwayGridDimensions(): GridDimensions {
    return new GridDimensions(0, 0, 20, 20);
  }

  private get minExtent(): Extent {
    return new Extent(-2000, -2000, 4000, 4000);
  }

  private isAlive({data}: ITile): boolean {
    const { row, column } = data;
    if (column < this.minColumn) {
      this.minColumn = column;
    } else if (column > this.maxColumn) {
      this.maxColumn = column;
    }

    if (row < this.minRow) {
      this.minRow = row;
    } else if (row > this.maxRow) {
      this.maxRow = row;
    }

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

  @Watch("conwayGridDimensions")
  private onConwayGridDimensionsChanged(newDimensions: GridDimensions) {
    this.conwayGrid.resize(newDimensions);
  }
}
</script>
