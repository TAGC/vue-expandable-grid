<template>
  <Card v-bind="$props">
    New live cells will spawn as the grid expands. Each cell has a
    <Control
      :value="habitability"
      :min="minHabitability"
      :max="maxHabitability"
      :validator="isValidHabitability"
      :width="40"
      @valid-input="$emit('habitability', $event)"
      @stable="$emit('stable', $event)"
    />
    % chance to be spawned alive.
  </Card>
</template>

<script lang="ts">
import { isNumber } from "lodash";
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import Card, { NextCardDirection } from "./Card.vue";
import Control from "./Control.vue";

@Component({ components: { Card, Control } })
export default class HabitabilityCard extends Vue {
  @Prop({ required: true })
  private nextCardDirection: NextCardDirection;

  @Prop({ required: true })
  private pointerAnimationDuration: number;

  @Prop({ required: true })
  private habitability: number;

  private get minHabitability() {
    return 0;
  }

  private get maxHabitability() {
    return 100;
  }

  private isValidHabitability(habitability: number) {
    return isNumber(habitability)
      && habitability >= this.minHabitability
      && habitability <= this.maxHabitability;
  }
}
</script>