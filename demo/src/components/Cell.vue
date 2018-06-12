<template>
  <div class="cell" :class="state" :style="styleObject">
    <SolidTile color="lightblue" :size="size"/>
  </div>
</template>

<script lang="ts">
import ExpandableGrid, { SolidTile } from "@/.";
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";

export type State = "born" | "stable" | "dying";

@Component({ components: { SolidTile } })
export default class Cell extends Vue {
  @Prop({ required: true })
  private size: number;

  @Prop({ required: true })
  private fadeRate: number;

  @Prop({ required: true })
  private state: State;

  private get styleObject() {
    return {
      transition: `opacity ${this.fadeRate}s linear`,
    };
  }
}
</script>

<style lang="scss" scoped>
.cell {
  height: 100%;
  width: 100%;

  &.born {
    opacity: 0.5;
  }

  &.dying {
    opacity: 0.25;
  }

  &.stable {
    opacity: 1;
  }
}
</style>