<template>
  <div :style="styleObject">
    <ExpandableGrid
      :items="cells"
      :tileSize="cellSize"
      :minExtent="minExtent"  
      @grid-resized="onGridResized"
      @grid-clicked="onGridClicked"
    >
      <SolidTile slot="grid-tile" slot-scope="{data}" v-bind="data" color="white" />
      <!-- <DebugTile slot="grid-tile" slot-scope="{data}" v-bind="data" :debug="`${data.column},${data.row}`" /> -->
      <Cell slot="grid-item" slot-scope="{data}" v-bind="data" :size="cellSize" :fadeRate="cellFadeRate" :state="data.state"/>
    </ExpandableGrid>
  </div>
</template>

<script lang="ts">
import * as _ from "lodash";

import ExpandableGrid, {
  DebugTile,
  Extent,
  IGridClickEventArgs,
  IGridItem,
  IGridResizeEventArgs,
  ITile,
  SolidTile,
} from "@/.";
import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import ConwayGrid, { GridDimensions, ICell, ICellPosition } from "../ConwayGrid";
import Cell, { State as CellState } from "./Cell.vue";

@Component({ components: { ExpandableGrid, Cell, DebugTile, SolidTile } })
export default class Grid extends Vue {
  private static readonly cellRegenerationRate = 500;
  private static readonly habitability = 0.25;

  private conwayGrid = new ConwayGrid(Grid.habitability, this.onCellsGenerated);
  private previousGeneration: ICellPosition[] = [];
  private currentGeneration: ICellPosition[] = [];
  private regenerationRunning = true;

  public mounted() {
    window.addEventListener("keyup", this.onKeyPressed);
    setInterval(() => this.regenerateCells(), Grid.cellRegenerationRate);
  }

  private get styleObject() {
    return {
      opacity: this.regenerationRunning ? 1 : 0.5,
    };
  }

  private get minExtent(): Extent {
    return new Extent(-200, -200, 400, 400);
  }

  private get bornCells(): IGridItem[] {
    const cells = _.differenceWith(this.currentGeneration, this.previousGeneration, _.isEqual);

    return cells.map((cell) => this.displayCell(cell, "born"));
  }

  private get stableCells(): IGridItem[] {
    const cells = _.intersectionWith(this.currentGeneration, this.previousGeneration, _.isEqual);

    return cells.map((cell) => this.displayCell(cell, "stable"));
  }

  private get dyingCells(): IGridItem[] {
    const cells = _.differenceWith(this.previousGeneration, this.currentGeneration, _.isEqual);

    return cells.map((cell) => this.displayCell(cell, "dying"));
  }

  private get cells(): IGridItem[] {
    return [...this.bornCells, ...this.stableCells, ...this.dyingCells];
  }

  private get cellSize(): number {
    return 100;
  }

  private get cellFadeRate(): number {
    return 0.001 * 0.5 * Grid.cellRegenerationRate;
  }

  private displayCell(cellPosition: ICellPosition, state: CellState): IGridItem {
    return {
      data: {
        state,
      },
      x: Math.floor(cellPosition.column * this.cellSize),
      y: Math.floor(cellPosition.row * this.cellSize),
      width: this.cellSize,
      height: this.cellSize,
    };
  }

  private regenerateCells() {
    if (!this.regenerationRunning) {
      return;
    }

    console.time("Next generation");
    this.conwayGrid.nextGeneration();
    console.timeEnd("Next generation");
  }

  private onGridResized(e: IGridResizeEventArgs) {
    console.log("Grid resized", e);
    this.conwayGrid.resize(e);
  }

  private onKeyPressed(e: KeyboardEvent) {
    const space = 32;

    if (e.keyCode === space) {
      this.regenerationRunning = !this.regenerationRunning;
    }
  }

  private onGridClicked({ row, column }: IGridClickEventArgs) {
    this.conwayGrid.toggleCellAtPosition(row, column);

    // Skips the transitional states (born, dying) after adding/removing the cell.
    if (this.conwayGrid.isCellAlive(row, column)) {
      this.currentGeneration.push({ row, column });
      this.previousGeneration.push({ row, column });
    } else {
      const isNotToggledCell = (cell) => !_.isEqual(cell, { row, column });
      this.currentGeneration = this.currentGeneration.filter(isNotToggledCell);
      this.previousGeneration = this.previousGeneration.filter(isNotToggledCell);
    }
  }

  private onCellsGenerated(cells: ICellPosition[]) {
    this.previousGeneration = [...this.currentGeneration];
    this.currentGeneration = cells;
  }
}
</script>