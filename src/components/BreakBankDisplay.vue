<script setup lang="ts">
defineProps<{
  minutes: string;
  seconds: string;
}>();
</script>

<template>
  <div class="bg-teal-900/20 border border-teal-800/30 px-6 py-4 rounded-lg flex flex-col items-center gap-1 min-w-[200px] backdrop-blur-md">
    <span class="text-slate-400 text-xs uppercase tracking-wider">Descanso Acumulado</span>
    <div class="flex items-baseline gap-2">
      <div class="flex flex-col items-center">
        <span class="text-3xl font-bold text-teal-400">{{ minutes }}</span>
        <span class="text-[10px] text-slate-500 uppercase">min</span>
      </div>
      <span class="text-2xl text-teal-400/50">:</span>
      <div class="flex flex-col items-center">
        <span class="text-3xl font-bold text-teal-400">{{ seconds }}</span>
        <span class="text-[10px] text-slate-500 uppercase">seg</span>
      </div>
    </div>
  </div>
</template>
