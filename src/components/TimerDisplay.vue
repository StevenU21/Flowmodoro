<script setup lang="ts">
import { type FlowMode, FlowMode as FlowModeEnum } from '../composables/useFlowmodoro';

defineProps<{
  mode: FlowMode;
  formattedMinutes: string;
  formattedSeconds?: string;
  opacity: string;
}>();
</script>

<template>
  <div :class="['flex items-baseline mb-12 transition-opacity duration-700', opacity]">
    <span v-if="mode !== FlowModeEnum.BREAK" class="text-[12rem] leading-none font-bold text-slate-100 tracking-tighter drop-shadow-2xl">
      {{ formattedMinutes }}
    </span>

    <div v-else class="flex items-baseline">
      <span class="text-[12rem] leading-none font-bold text-teal-400 tracking-tighter drop-shadow-2xl animate-pulse">
        {{ formattedMinutes }}
      </span>
      <span class="text-[8rem] leading-none font-bold text-teal-400/50 tracking-tighter mx-2">:</span>
      <span class="text-[12rem] leading-none font-bold text-teal-400 tracking-tighter drop-shadow-2xl animate-pulse">
        {{ formattedSeconds }}
      </span>
    </div>
  </div>
</template>
