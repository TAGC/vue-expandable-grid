<template>
  <md-card class="md-elevation-20">
    <md-card-content>
      <div class="card-content-layout" ref="cardContentLayout">
        <div v-if="nextCardDirection" :class="`card-pointer-${nextCardDirection}`" :style="cardPointerStyleObject">
          <md-icon>{{cardPointer}}</md-icon>
        </div>
        <div v-if="displayBody" class="card-body" ref="cardBody">
          <slot  />
        </div>
        <div v-else class="zoom-text">
          <b>Zoom in to view card</b>
          <br />
          <small>Ctrl + wheel</small>
        </div>
      </div>
    </md-card-content>
  </md-card>
</template>

<script lang="ts">
import { delay } from "lodash";
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import Control from "./Control.vue";

export type NextCardDirection = "up" | "down" | "left" | "right";

@Component({ components: { Control } })
export default class Card extends Vue {
  // Should be kept in sync with $pointer-section.
  private static readonly pointerSectionSize = 50;

  private displayBody = true;

  @Prop({ default: undefined })
  private nextCardDirection: NextCardDirection | undefined;

  @Prop({ required: true })
  private pointerAnimationDuration: number;

  private mounted() {
    const cardBody = this.$refs.cardBody as Element;
    const cardContentLayout = this.$refs.cardContentLayout as Element;

    const bodyHeight = cardBody.clientHeight;
    const layoutHeight = cardContentLayout.clientHeight;
    const tooTall = bodyHeight + Card.pointerSectionSize * 2 >= layoutHeight;

    this.displayBody = !tooTall;
  }

  private get cardPointerStyleObject() {
    return {
      "animation-duration": `${this.pointerAnimationDuration}s`,
    };
  }

  private get contentFitsCurrentSize(): boolean {
    const cardBody = this.$refs.cardBody as Element;
    const cardContentLayout = this.$refs.cardContentLayout as Element;

    console.log({cardBody, cardContentLayout});
    return false;
  }

  private get cardPointer(): string {
    switch (this.nextCardDirection) {
      case undefined: return "";
      case "up": return "expand_less";
      case "down": return "expand_more";
      case "left": return "chevron_left";
      case "right": return "chevron_right";
      default: throw new Error(`Invalid direction: ${this.nextCardDirection}`);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "variables";
$pointer-section: 50px;
$pointer-movement: calc(#{$pointer-section} / 5);
$neg-pointer-movement: calc(-#{$pointer-section} / 5);

.md-card {
  font-size: $font-size;
  position: absolute;
  width: 100%;
  height: 100%;
  background: white;
  border: thin solid black;
  user-select: none;

  .md-card-content {
    font-size: $font-size;
    padding: 0;
  }

  .md-icon {
    display: block;
  }

  .card-content-layout {
    display: grid;
    grid-template-columns: $pointer-section 1fr $pointer-section;
    grid-template-rows: $pointer-section 1fr $pointer-section;
    align-items: center;
    justify-items: center;
    height: 100%;
    width: 100%;
    padding: 5px;
  }

  .card-pointer {
    align-content: center;
    justify-content: center;
    animation-name: move-right;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }

  .card-pointer-up {
    @extend .card-pointer;
    animation-name: move-up;
    grid-column: 2;
    grid-row: 1;
  }

  .card-pointer-down {
    @extend .card-pointer;
    animation-name: move-down;
    grid-column: 2;
    grid-row: 3;
  }

  .card-pointer-left {
    @extend .card-pointer;
    animation-name: move-left;
    grid-column: 1;
    grid-row: 2;
  }

  .card-pointer-right {
    @extend .card-pointer;
    animation-name: move-right;
    grid-column: 3;
    grid-row: 2;
  }
  
  .card-body {
    grid-row: 2;
    grid-column: 2;
    justify-self: start;
    align-self: start;
    height: 100%;
    width: 100%;
  }

  .zoom-text {
    text-align: center;
    align-self: center;
    grid-column: 2;
    grid-row: 2;
  }
}

@keyframes move-up {
  from {
    transform: translateY(0px);
    opacity: 1;
  }

  to {
    transform: translateY($neg-pointer-movement);
    opacity: 0;
  }
}

@keyframes move-down {
  from {
    transform: translateY(0px);
    opacity: 1;
  }

  to {
    transform: translateY($pointer-movement);
    opacity: 0;
  }
}

@keyframes move-left {
  from {
    transform: translateX(0px);
    opacity: 1;
  }

  to {
    transform: translateX($neg-pointer-movement);
    opacity: 0;
  }
}

@keyframes move-right {
  from {
    transform: translateX(0px);
    opacity: 1;
  }

  to {
    transform: translateX($pointer-movement);
    opacity: 0;
  }
}
</style>
