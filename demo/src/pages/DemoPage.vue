<template>
  <div class="demo-page">
    <ConwayGrid
      :minExtent="minGridExtent"
      :cellSize="cellSize"
      :cellRegenerationRate="cellRegenerationRate"
      :habitability="habitability / 100"
      :paused="paused"
      :additionalItems="cards"
      @toggled-cell="onToggledCell"
    >
      <component
        slot="additional-item"
        slot-scope="{data}"
        :is="data.component"
        :nextCardDirection="data.nextCardDirection"
        :pointerAnimationDuration="cellRegenerationRate / 1000"
        :cellRegenerationRate="cellRegenerationRate"
        :cellSize="cellSize"
        :habitability="habitability"
        @stable="paused = !$event"
        @cell-size="cellSize = $event"
        @cell-regeneration-rate="cellRegenerationRate = $event"
        @habitability="habitability = $event"
      />
    </ConwayGrid>
  </div>
</template>

<script lang="ts">
import { Extent, IGridItem, TileExtent } from "@/.";
import { debounce } from "lodash";
import Vue from "vue";
import { Component } from "vue-property-decorator";
import {
  CellRegenerationRateCard,
  CellSizeCard,
  GridEventsCard,
  HabitabilityCard,
  IntroCard,
  NextCardDirection,
  PerformanceCard,
} from "../cards";
import { ConwayGrid } from "../grid";

const cards = {
  CellRegenerationRateCard,
  CellSizeCard,
  GridEventsCard,
  HabitabilityCard,
  IntroCard,
  PerformanceCard,
};

@Component({ components: { ConwayGrid, ...cards } })
export default class DemoPage extends Vue {
  private static createCard(
    id: string,
    extent: TileExtent,
    nextCardDirection: NextCardDirection | null) {
    return { id, extent, data: { component: id, nextCardDirection } };
  }

  private cellRegenerationRate = 2000;
  private cellSize = 50;
  private habitability = 25;
  private paused = false;
  private debouncedUnpause = debounce(this.unpause, 1000);

  private get minGridExtent(): Extent {
    return new Extent(-200, -200, 400, 400);
  }

  private get cards(): IGridItem[] {
    return [
      DemoPage.createCard("IntroCard", new TileExtent(-3, -3, 6, 6), "right"),
      DemoPage.createCard("CellSizeCard", new TileExtent(18, -3, 6, 6), "up"),
      DemoPage.createCard("CellRegenerationRateCard", new TileExtent(18, -18, 6, 6), "left"),
      DemoPage.createCard("HabitabilityCard", new TileExtent(4, -17, 8, 4), "up"),
      DemoPage.createCard("GridEventsCard", new TileExtent(4, -30, 8, 6), "up"),
      DemoPage.createCard("PerformanceCard", new TileExtent(3, -45, 10, 7), null),
    ];
  }

  private onToggledCell() {
    console.log("paused");
    this.paused = true;
    this.debouncedUnpause();
  }

  private unpause() {
    console.log("unpaused");
    this.paused = false;
  }
}
</script>

<style lang="scss" scoped>
.demo-page {
  display: grid;
  height: 100vh;
  width: 100vw;
  position: relative;
}
</style>

