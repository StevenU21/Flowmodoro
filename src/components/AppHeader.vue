<script setup lang="ts">
defineProps<{
  dailyTotal: string;
}>();

const emit = defineEmits<{
  openInfo: [];
}>();
</script>

<template>
  <header class="relative z-10 w-full px-6 py-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm border-b border-white/5">
    <div class="flex items-center gap-4">
      <h1 class="text-xl font-bold tracking-widest text-teal-400">Flowmodoro</h1>
      <div class="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
        <span class="text-xs text-slate-400 uppercase tracking-wider">Total Hoy:</span>
        <span class="text-sm font-bold text-teal-300">{{ dailyTotal }}</span>
      </div>
    </div>
    
    <button 
      @click="emit('openInfo')"
      class="text-sm text-slate-400 hover:text-teal-300 transition-colors flex items-center gap-2 group"
    >
      <span>¿Cómo funciona?</span>
      <span class="w-5 h-5 flex items-center justify-center border border-slate-600 rounded-full group-hover:border-teal-300">?</span>
    </button>
  </header>
</template>
