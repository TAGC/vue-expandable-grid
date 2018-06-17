<template>
  <Card nextCardDirection="up" :pointerAnimationDuration="pointerAnimationDuration">
    You can configure the size of the tiles and items on the grid.
    <p />
    Currently each cell in the grid is
    <Control
      :value="cellSize"
      :min="minCellSize"
      :max="maxCellSize"
      :validator="isValidCellSize"
      :width="40"
      @valid-input="$emit('cell-size', $event)"
      @stable="$emit('stable', $event)"
    />
    pixels along each side.
  </Card>
</template>

<script lang="ts">
import { isNumber } from "lodash";
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import Card from "./Card.vue";
import Control from "./Control.vue";

@Component({ components: { Card, Control } })
export default class CellSizeCard extends Vue {
  @Prop({ required: true })
  private pointerAnimationDuration: number;

  @Prop({ required: true })
  private cellSize: number;

  private get minCellSize() {
    return 45;
  }

  private get maxCellSize() {
    return 55;
  }

  private isValidCellSize(cellSize: number) {
    return isNumber(cellSize)
      && cellSize >= this.minCellSize
      && cellSize <= this.maxCellSize;
  }
}
</script>