<template>
  <div id="app">
    <ConwayGrid
      :minExtent="minGridExtent"
      :cellSize="cellSize"
      :cellRegenerationRate="cellRegenerationRate"
      :habitability="habitability"
      :paused="paused"
      :additionalItems="cards"
    >
      <component :is="data.component" slot="additional-item" slot-scope="{data}" @stable="paused = !$event" />
    </ConwayGrid>
  </div>
</template>

<script lang="ts">
import { Extent, IGridItem, TileExtent } from "@/.";
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { IntroCard, TileSizeCard } from "./cards";
import ConwayGrid from "./ConwayGrid.vue";

@Component({ components: { ConwayGrid, IntroCard, TileSizeCard } })
export default class App extends Vue {
  private cellSize = 50;
  private cellRegenerationRate = 1000;
  private habitability = 0.25;
  private paused = false;

  private get minGridExtent(): Extent {
    return new Extent(-200, -200, 400, 400);
  }

  private get cards(): IGridItem[] {
    return [
      this.createCard("IntroCard", new TileExtent(-3, -3, 6, 6)),
      this.createCard("TileSizeCard", new TileExtent(18, -3, 6, 6)),
    ];
  }

  private createCard(identifier: string, extent: TileExtent) {
    return {
      extent,
      data: {
        component: identifier,
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

