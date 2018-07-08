<template>
  <Card v-bind="$props">
    ExpandableGrid currently has a pretty significant impact on performance.
    These are some tips that can be used to improve performance:
    <ul>
      <li>Increasing tile size will mean fewer tiles will need to be rendered to cover a given area</li>
      <li>Limiting the extent to which the user can zoom out the grid</li>
      <li>
        Specifying a minimum grid area will prevent the need to regenerate tiles while the user
        navigates the grid within that area
      </li>
    </ul>
  </Card>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import Card, { NextCardDirection } from "./Card.vue";

@Component({ components: { Card } })
export default class PerformanceCard extends Vue {
  @Prop({ required: true })
  private nextCardDirection: NextCardDirection;

  @Prop({ required: true })
  private pointerAnimationDuration: number;
}
</script>