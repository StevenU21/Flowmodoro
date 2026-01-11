<script setup lang="ts">
import type { Session } from '../composables/useFlowmodoro';

defineProps<{
  history: Session[];
}>();
</script>

<template>
  <div v-if="history.length > 0" class="w-full max-w-md px-6">
    <div class="flex items-center justify-center gap-2 mb-4 opacity-50">
      <div class="h-px bg-slate-700 w-12"></div>
      <span class="text-xs text-slate-500 uppercase tracking-widest">Últimas Sesiones</span>
      <div class="h-px bg-slate-700 w-12"></div>
    </div>
    
    <div class="flex flex-wrap justify-center gap-2 max-h-20 overflow-y-auto">
      <div 
        v-for="session in history.slice(-5).reverse()" 
        :key="session.id"
        class="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-400"
      >
        {{ Math.floor(session.duration / 60000) }}m
      </div>
    </div>
  </div>
</template>
