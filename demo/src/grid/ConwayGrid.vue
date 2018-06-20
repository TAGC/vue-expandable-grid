<template>
  <div class="conway-grid-overlay">
    <ExpandableGrid
      :items="[...cells, ...additionalItems]"
      :tileSize="cellSize"
      :minExtent="minExtent"  
      @grid-resized="onGridResized"
      @grid-clicked="onGridClicked"
      @grid-zoomed="onGridZoomed"
      startCentered
    >
      <SolidTile slot="grid-tile" slot-scope="{data}" v-bind="data" color="white" />
      <!-- <DebugTile slot="grid-tile" slot-scope="{data}" v-bind="data" :debug="`${data.column},${data.row}`" :style="styleObject" /> -->
      <div slot="grid-item" slot-scope="{data}">
        <Cell v-if="data.isCell" v-bind="data" :disabled="paused"/>
        <slot v-else name="additional-item" :data="data" />
      </div>
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
  TileExtent,
} from "@/.";
import { ZERO_EXTENT } from "@/components/ExtentCalculator";
import { differenceWith, intersectionWith, isEqual } from "lodash";
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";
import Cell from "./Cell.vue";
import ConwayCalculator, { GridDimensions, ICell, ICellPosition } from "./ConwayCalculator";

@Component({ components: { ExpandableGrid, Cell, DebugTile, SolidTile } })
export default class ConwayGrid extends Vue {
  private static readonly LIVE_CELL_ID = "live cell";
  private static readonly HUE_OFFSET = Math.random() * 360;
  private static readonly HUE_SCALE = 0.5;

  private static displayCell(cellPosition: ICellPosition): IGridItem {
    const color = ConwayGrid.mapPositionToColor(cellPosition);

    return {
      id: ConwayGrid.LIVE_CELL_ID,
      data: { color, isCell: true },
      extent: new TileExtent(cellPosition.column, cellPosition.row, 1, 1),
    };
  }

  private static mapPositionToColor({ column, row }: ICellPosition): string {
    const hue = ((row + column) * ConwayGrid.HUE_SCALE + ConwayGrid.HUE_OFFSET) % 360;
    const saturation = 100;
    const lightness = 75;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  private calculator: ConwayCalculator | null = null;
  private currentGeneration: ICellPosition[] = [];
  private regenerationTimer: any = null;
  private zoomLevel = 0;

  @Prop({ default: 100 })
  private cellSize: number;

  @Prop({ default: 1000 })
  private cellRegenerationRate: number;

  @Prop({ default: () => ZERO_EXTENT })
  private minExtent: Extent;

  @Prop({ default: 0.25 })
  private habitability: number;

  @Prop({ default: false })
  private paused: boolean;

  @Prop({ default: () => [] })
  private additionalItems: IGridItem[];

  public mounted() {
    this.calculator = new ConwayCalculator(this.onCellsGenerated);
    this.onHabitabilityChanged(this.habitability);
    this.toggleRegeneration(this.paused);
  }

  private get styleObject() {
    return {
      opacity: this.paused ? 0.5 : 1,
    };
  }

  private get cells(): IGridItem[] {
    return this.currentGeneration.map(ConwayGrid.displayCell);
  }

  private regenerateCells() {
    console.time("Next generation");
    this.calculator!.nextGeneration();
    console.timeEnd("Next generation");
  }

  @Watch("paused")
  private toggleRegeneration(newPaused: boolean) {
    if (newPaused) {
      window.clearInterval(this.regenerationTimer!);
      this.regenerationTimer = null;
    } else {
      this.regenerationTimer = setInterval(this.regenerateCells, this.cellRegenerationRate);
    }
  }

  @Watch("habitability")
  private onHabitabilityChanged(habitability: number) {
    this.calculator!.habitability = habitability;
  }

  @Watch("cellRegenerationRate")
  private onCellRegenerationRateChanged() {
    this.toggleRegeneration(!this.paused);
    this.toggleRegeneration(this.paused);
  }

  private onGridResized(e: IGridResizeEventArgs) {
    if (this.calculator !== null) {
      this.calculator!.resize(e);
    }
  }

  private onGridZoomed(zoomLevel: number) {
    this.zoomLevel = zoomLevel;
  }

  private onGridClicked({ row, column, itemId }: IGridClickEventArgs) {
    switch (itemId) {
      case ConwayGrid.LIVE_CELL_ID:
        const isNotToggledCell = (cell) => !isEqual(cell, { row, column });
        this.calculator!.toggleCellAtPosition(row, column);
        this.currentGeneration = this.currentGeneration.filter(isNotToggledCell);
        this.$emit("toggled-cell");
        break;

      case undefined:
        this.calculator!.toggleCellAtPosition(row, column);
        this.currentGeneration.push({ row, column });
        this.$emit("toggled-cell");
        break;
    }
  }

  private onCellsGenerated(cells: ICellPosition[]) {
    this.currentGeneration = cells;
  }
}
</script>

<style lang="scss" scoped>
.conway-grid-overlay {
  position: relative;
}
</style>
