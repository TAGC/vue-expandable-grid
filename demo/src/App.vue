<template>
  <div id="app">
    <ConwayGrid
      :minExtent="minGridExtent"
      :cellSize="cellSize"
      :cellRegenerationRate="cellRegenerationRate"
      :habitability="habitability / 100"
      :paused="paused"
      :additionalItems="cards"
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
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { CellRegenerationRateCard, CellSizeCard, HabitabilityCard, IntroCard } from "./cards";
import { ConwayGrid } from "./grid";

const cards = {
  CellRegenerationRateCard,
  CellSizeCard,
  HabitabilityCard,
  IntroCard,
};

@Component({ components: { ConwayGrid, ...cards } })
export default class App extends Vue {
  private cellRegenerationRate = 1000;
  private cellSize = 50;
  private habitability = 25;
  private paused = false;

  private get minGridExtent(): Extent {
    return new Extent(-200, -200, 400, 400);
  }

  private get cards(): IGridItem[] {
    return [
      this.createCard("IntroCard", new TileExtent(-3, -3, 6, 6)),
      this.createCard("CellSizeCard", new TileExtent(18, -3, 6, 6)),
      this.createCard("CellRegenerationRateCard", new TileExtent(18, -18, 6, 6)),
      this.createCard("HabitabilityCard", new TileExtent(4, -17, 8, 4)),
    ];
  }

  private createCard(id: string, extent: TileExtent) {
    return {
      id,
      extent,
      data: {
        component: id,
      },
    };
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

