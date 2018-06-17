<template>
  <div id="app">
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
} from "./cards";
import { ConwayGrid } from "./grid";

const cards = {
  CellRegenerationRateCard,
  CellSizeCard,
  GridEventsCard,
  HabitabilityCard,
  IntroCard,
};

@Component({ components: { ConwayGrid, ...cards } })
export default class App extends Vue {
  private static createCard(id: string, extent: TileExtent) {
    return { id, extent, data: { component: id } };
  }

  private cellRegenerationRate = 1000;
  private cellSize = 50;
  private habitability = 25;
  private paused = false;
  private debouncedUnpause = debounce(this.unpause, 1000);

  private get minGridExtent(): Extent {
    return new Extent(-200, -200, 400, 400);
  }

  private get cards(): IGridItem[] {
    return [
      App.createCard("IntroCard", new TileExtent(-3, -3, 6, 6)),
      App.createCard("CellSizeCard", new TileExtent(18, -3, 6, 6)),
      App.createCard("CellRegenerationRateCard", new TileExtent(18, -18, 6, 6)),
      App.createCard("HabitabilityCard", new TileExtent(4, -17, 8, 4)),
      App.createCard("GridEventsCard", new TileExtent(4, -30, 8, 6)),
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
#app {
  display: grid;
  height: 100vh;
  width: 100vw;
  position: relative;
}
</style>

