<template>
  <Card v-bind="$props">
    Events will be generated as you interact with the grid. This makes it possible to write
    Vue components that wrap ExpandableGrid and perform specific actions when this happens.
    <p />
    Try clicking cells around the grid. Clicking a live cell will kill it, while clicking a dead
    cell will bring it back to life.
  </Card>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import Card, { NextCardDirection } from "./Card.vue";

@Component({ components: { Card } })
export default class GridEventsCard extends Vue {
  @Prop({ required: true })
  private nextCardDirection: NextCardDirection;

  @Prop({ required: true })
  private pointerAnimationDuration: number;
}
</script>