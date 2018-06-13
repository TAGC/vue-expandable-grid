<template>
  <div class="conway-grid-overlay" :style="styleObject">
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
import ExpandableGrid, {
  DebugTile,
  Extent,
  IGridClickEventArgs,
  IGridItem,
  IGridResizeEventArgs,
  ITile,
  SolidTile,
} from "@/.";
import { ZERO_EXTENT } from "@/components/ExtentCalculator";
import { differenceWith, intersectionWith, isEqual } from "lodash";
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";
import Cell, { State as CellState } from "./Cell.vue";
import ConwayCalculator, { GridDimensions, ICell, ICellPosition } from "./ConwayCalculator";

@Component({ components: { ExpandableGrid, Cell, DebugTile, SolidTile } })
export default class ConwayGrid extends Vue {
  private conwayGrid: ConwayCalculator | null = null;
  private previousGeneration: ICellPosition[] = [];
  private currentGeneration: ICellPosition[] = [];
  private regenerationTimer: any = null;

  @Prop({ default: 100 })
  private cellSize: number;

  @Prop({ default: 1000 })
  private cellRegenerationRate: number;

  @Prop({ default: () => ZERO_EXTENT })
  private minExtent: Extent;

  @Prop({ default: 0.25 })
  private habitability: number;

  public mounted() {
    this.conwayGrid = new ConwayCalculator(this.habitability, this.onCellsGenerated);
    window.addEventListener("keyup", this.onKeyPressed);
    this.toggleRegeneration();
  }

  private get styleObject() {
    return {
      opacity: this.regenerationRunning ? 1 : 0.5,
    };
  }

  private get regenerationRunning() {
    return this.regenerationTimer !== null;
  }

  private get bornCells(): IGridItem[] {
    const cells = differenceWith(this.currentGeneration, this.previousGeneration, isEqual);

    return cells.map((cell) => this.displayCell(cell, "born"));
  }

  private get stableCells(): IGridItem[] {
    const cells = intersectionWith(this.currentGeneration, this.previousGeneration, isEqual);

    return cells.map((cell) => this.displayCell(cell, "stable"));
  }

  private get dyingCells(): IGridItem[] {
    const cells = differenceWith(this.previousGeneration, this.currentGeneration, isEqual);

    return cells.map((cell) => this.displayCell(cell, "dying"));
  }

  private get cells(): IGridItem[] {
    return [...this.bornCells, ...this.stableCells, ...this.dyingCells];
  }

  private get cellFadeRate(): number {
    return 0.001 * 0.5 * this.cellRegenerationRate;
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
    console.time("Next generation");
    this.conwayGrid!.nextGeneration();
    console.timeEnd("Next generation");
  }

  private toggleRegeneration() {
    if (this.regenerationRunning) {
      window.clearInterval(this.regenerationTimer!);
      this.regenerationTimer = null;
    } else {
      this.regenerationTimer = setInterval(this.regenerateCells, this.cellRegenerationRate);
    }
  }

  @Watch("cellRegenerationRate")
  private onCellRegenerationRateChanged() {
    this.toggleRegeneration();
    this.toggleRegeneration();
  }

  private onGridResized(e: IGridResizeEventArgs) {
    if (this.conwayGrid !== null) {
      this.conwayGrid!.resize(e);
    }
  }

  private onKeyPressed(e: KeyboardEvent) {
    const space = 32;

    if (e.keyCode === space) {
      this.toggleRegeneration();
    }
  }

  private onGridClicked({ row, column }: IGridClickEventArgs) {
    this.conwayGrid!.toggleCellAtPosition(row, column);

    // Skips the transitional states (born, dying) after adding/removing the cell.
    if (this.conwayGrid!.isCellAlive(row, column)) {
      this.currentGeneration.push({ row, column });
      this.previousGeneration.push({ row, column });
    } else {
      const isNotToggledCell = (cell) => !isEqual(cell, { row, column });
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

<style lang="scss" scoped>
.conway-grid-overlay {
  position: relative;
}
</style>
