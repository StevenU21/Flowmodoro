<script setup lang="ts">
import type { FlowMode } from '../composables/useFlowmodoro';

defineProps<{
  mode: FlowMode;
  isRunning: boolean;
  sessionElapsed: number;
}>();

const emit = defineEmits<{
  startFlow: [];
  pause: [];
  stopFlowAndBank: [];
  stopBreak: [];
}>();
</script>

<template>
  <div class="flex gap-4 mb-16">
    <button 
      v-if="mode === 'idle'" 
      @click="emit('startFlow')"
      class="px-8 py-3 bg-teal-600 text-slate-900 font-bold rounded hover:bg-teal-500 transition-all transform hover:scale-105 shadow-lg shadow-teal-500/20"
    >
      {{ sessionElapsed > 0 ? 'REANUDAR' : 'INICIAR FLOW' }}
    </button>

    <div v-if="mode === 'flow'" class="flex gap-4">
      <button @click="emit('pause')" class="px-6 py-3 border border-slate-700 text-slate-400 hover:text-white rounded">
        PAUSAR
      </button>
      <button 
        @click="emit('stopFlowAndBank')"
        class="px-8 py-3 border border-teal-500 text-teal-400 font-bold rounded hover:bg-teal-900/50 transition-all"
      >
        REGISTRAR DESCANSO
      </button>
    </div>

    <div v-if="mode === 'break'" class="flex flex-col items-center gap-2">
      <button 
        @click="emit('stopBreak')"
        class="px-8 py-3 bg-slate-700 text-slate-200 font-bold rounded hover:bg-slate-600 transition-all"
      >
        SALTAR DESCANSO
      </button>
      <span class="text-[10px] text-slate-600 uppercase tracking-wide">
        (Tiempo restante se pierde)
      </span>
    </div>
  </div>
</template>
