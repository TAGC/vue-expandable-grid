<template>
  <div @click="regenerateCells">
    <ExpandableGrid
      :items="cells"
      :tileSize="cellSize"
      :minExtent="minExtent"
      @grid-resized="onGridResized"
    >
      <SolidTile slot="grid-tile" slot-scope="{data}" v-bind="data" color="white" />
      <!-- <DebugTile slot="grid-tile" slot-scope="{data}" v-bind="data" :debug="`${data.column},${data.row}`" /> -->
      <SolidTile slot="grid-item" slot-scope="{data}" v-bind="data" color="lightblue" :size="cellSize"/>
    </ExpandableGrid>
  </div>
</template>

<script lang="ts">
import ExpandableGrid, {
  DebugTile,
  Extent,
  IGridItem,
  IGridResizeEventArgs,
  ITile,
  SolidTile,
} from "@/.";
import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import ConwayGrid, { GridDimensions, ICell } from "../ConwayGrid";
import Cell from "./Cell.vue";

@Component({ components: { ExpandableGrid, Cell, DebugTile, SolidTile } })
export default class Grid extends Vue {
  private static readonly cellRegenerationRate = 1000;
  private static readonly habitability = 0.2;

  private conwayGrid = new ConwayGrid(Grid.habitability, this.onCellsGenerated);
  private cells: IGridItem[] = [];

  public mounted() {
    setInterval(() => this.regenerateCells(), Grid.cellRegenerationRate);
  }

  private get minExtent(): Extent {
    return new Extent(-200, -200, 400, 400);
  }

  private get cellSize(): number {
    return 100;
  }

  private isAlive({ data }: ITile): boolean {
    const { row, column } = data;

    return this.conwayGrid.liveCellAt(row, column);
  }

  private regenerateCells() {
    console.time("Next generation");
    this.conwayGrid.nextGeneration();
    console.timeEnd("Next generation");
  }

  private onGridResized(e: IGridResizeEventArgs) {
    console.log("Grid resized", e);
    this.conwayGrid.resize(e);
  }

  private onCellsGenerated(cells: ICell[]) {
    this.cells = cells.map((cell) => ({
      data: {},
      x: Math.floor(cell.column * this.cellSize),
      y: Math.floor(cell.row * this.cellSize),
      width: this.cellSize,
      height: this.cellSize,
    }));
  }
}
</script>