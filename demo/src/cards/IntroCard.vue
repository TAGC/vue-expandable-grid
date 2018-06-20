<template>
  <Card v-bind="$props">
    This demo showcases how vue-expandable-grid can be used to create an indefinitely-large Conway's Game of Life.
    <p />
    You can zoom and navigate around the grid using the mouse and trackpad. <b>Try navigating right.</b>
  </Card>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import Card, { NextCardDirection } from "./Card.vue";

@Component({ components: { Card } })
export default class IntroCard extends Vue {
  @Prop({ required: true })
  private nextCardDirection: NextCardDirection;

  @Prop({ required: true })
  private pointerAnimationDuration: number;
}
</script>