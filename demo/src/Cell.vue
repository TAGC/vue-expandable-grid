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

  @Prop({ default: false })
  private paused: boolean;

  private get styleObject() {
    return {
      "transition": `opacity ${this.fadeRate}s linear`,
      "--opacity-modifier": this.paused ? 0.5 : 1,
    };
  }
}
</script>

<style lang="scss" scoped>
.cell {
  height: 100%;
  width: 100%;

  &.born {
    opacity: calc(0.5 * var(--opacity-modifier));
  }

  &.dying {
    opacity: calc(0.25 * var(--opacity-modifier));
  }

  &.stable {
    opacity: calc(1 * var(--opacity-modifier));
  }
}
</style>