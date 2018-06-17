<template>
  <Card nextCardDirection="up">
    You can configure the size of the tiles and items on the grid.
    <p />
    Currently each cell in the grid is
    <Control
      v-model.number="cellSize"
      :min="minCellSize"
      :max="maxCellSize"
      :validator="isValidCellSize"
      :width="40"
      @stable="$emit('stable', $event)"
    />
    pixels along each side.
  </Card>
</template>

<script lang="ts">
import { isNumber } from "lodash";
import Vue from "vue";
import { Component } from "vue-property-decorator";
import Card from "./Card.vue";
import Control from "./Control.vue";

@Component({ components: { Card, Control } })
export default class TileSizeCard extends Vue {
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