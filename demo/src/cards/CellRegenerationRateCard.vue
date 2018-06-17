<template>
  <Card nextCardDirection="left" :pointerAnimationDuration="pointerAnimationDuration">
    Items can be added and removed from the grid at any time.
    <br />
    In the case of this demo, we regenerate the live cells (the grid items) every
    <Control
      :value="cellRegenerationRate"
      :min="minRegenerationRate"
      :max="maxRegenerationRate"
      :validator="isValidRegenerationRate"
      :width="60"
      @valid-input="$emit('cell-regeneration-rate', $event)"
      @stable="$emit('stable', $event)"
    />
    milliseconds.
  </Card>
</template>

<script lang="ts">
import { isNumber } from "lodash";
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import Card from "./Card.vue";
import Control from "./Control.vue";

@Component({ components: { Card, Control } })
export default class CellRegenerationRateCard extends Vue {
  @Prop({ required: true })
  private pointerAnimationDuration: number;

  @Prop({ required: true })
  private cellRegenerationRate: number;

  private get minRegenerationRate() {
    return 500;
  }

  private get maxRegenerationRate() {
    return 10000;
  }

  private isValidRegenerationRate(cellRegenerationRate: number) {
    return isNumber(cellRegenerationRate)
      && cellRegenerationRate >= this.minRegenerationRate
      && cellRegenerationRate <= this.maxRegenerationRate;
  }
}
</script>