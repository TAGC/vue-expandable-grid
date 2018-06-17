<template>
  <Card nextCardDirection="right">
    This demo showcases how vue-expandable-grid can be used to create an indefinitely-large Conway's Game of Life.
    <p />
    You can zoom and navigate around the grid using the mouse and trackpad. <b>Try navigating right.</b>
    <p />
    Try setting the cell size to
    <Control
      v-model.number="cellSize"
      :min="minCellSize"
      :max="maxCellSize"
      :validator="isValidCellSize"
      :width="40"
      @stable="$emit('stable', $event)"
    />
    px.
  </Card>
</template>

<script lang="ts">
import { isNumber } from "lodash";
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import Card from "./Card.vue";
import Control from "./Control.vue";

@Component({ components: { Card, Control } })
export default class IntroCard extends Vue {
  private cellSize = 50;

  private get minCellSize() {
    return 45;
  }

  private get maxCellSize() {
    return 55;
  }

  private isValidCellSize(cellSize: number) {
    return isNumber(cellSize) && cellSize >= this.minCellSize && cellSize <= this.maxCellSize;
  }
}
</script>