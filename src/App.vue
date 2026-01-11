<script setup lang="ts">
import { useFlowmodoro } from './composables/useFlowmodoro';
import { ref, computed } from 'vue';

const {
  mode,
  elapsedTime,
  earnedBreakTime,
  isRunning,
  startFocus,
  pause,
  reset,
  formatTime
} = useFlowmodoro();

const formattedElapsed = computed(() => formatTime(elapsedTime.value));
const formattedBreak = computed(() => formatTime(earnedBreakTime.value));

const timerOpacity = computed(() => isRunning.value ? 'opacity-100' : 'opacity-80');
const deepWorkLabelClass = computed(() => isRunning.value ? 'opacity-50' : 'opacity-30');

const showInfo = ref(false);
const toggleInfo = () => showInfo.value = !showInfo.value;
</script>

<template>
  <div class="flex flex-col min-h-screen bg-slate-900 text-teal-500 font-mono selection:bg-teal-500 selection:text-slate-900 transition-colors duration-700 relative overflow-hidden">
    
    <div class="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 pointer-events-none"></div>

    <header class="relative z-10 w-full px-6 py-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm border-b border-white/5">
      <h1 class="text-xl font-bold tracking-widest text-teal-400">Flowmodoro</h1>
      <button 
        @click="toggleInfo"
        class="text-sm text-slate-400 hover:text-teal-300 transition-colors flex items-center gap-2 group"
      >
        <span>¿Cómo funciona?</span>
        <span class="w-5 h-5 flex items-center justify-center border border-slate-600 rounded-full group-hover:border-teal-300">?</span>
      </button>
    </header>

    <main class="relative z-10 flex-grow flex flex-col items-center justify-center">
      
      <div :class="['text-xs tracking-[0.2em] uppercase transition-opacity duration-700 mb-8', deepWorkLabelClass]">
        {{ isRunning ? 'Modo Enfoque' : 'Listo para el Flow' }}
      </div>

      <div :class="['flex items-baseline mb-12 transition-opacity duration-700', timerOpacity]">
        <span class="text-[12rem] leading-none font-bold text-slate-100 tracking-tighter drop-shadow-2xl">
          {{ formattedElapsed.minutes }}
        </span>
      </div>

      <div class="flex gap-4 mb-16">
        <button 
          v-if="!isRunning" 
          @click="startFocus"
          class="px-8 py-3 bg-teal-600 text-slate-900 font-bold rounded hover:bg-teal-500 transition-all transform hover:scale-105 shadow-lg shadow-teal-500/20"
        >
          {{ elapsedTime > 0 ? 'REANUDAR' : 'INICIAR FLOW' }}
        </button>

        <button 
          v-if="isRunning" 
          @click="pause"
          class="px-8 py-3 border border-slate-700 text-slate-400 rounded hover:border-slate-500 hover:text-slate-200 transition-all opacity-60 hover:opacity-100"
        >
          REGISTRAR DESCANSO
        </button>

        <button 
          v-if="!isRunning && elapsedTime > 0" 
          @click="reset"
          class="px-6 py-3 text-slate-600 hover:text-red-400 transition-colors text-sm"
        >
          REINICIAR
        </button>
      </div>

      <div class="bg-teal-900/20 border border-teal-800/30 px-6 py-4 rounded-lg flex flex-col items-center gap-1 min-w-[200px] backdrop-blur-md">
        <span class="text-slate-400 text-xs uppercase tracking-wider">Descanso Acumulado</span>
        <div class="flex items-baseline gap-2">
          <div class="flex flex-col items-center">
            <span class="text-3xl font-bold text-teal-400">{{ formattedBreak.minutes }}</span>
            <span class="text-[10px] text-slate-500 uppercase">min</span>
          </div>
          <span class="text-2xl text-teal-400/50">:</span>
          <div class="flex flex-col items-center">
            <span class="text-3xl font-bold text-teal-400">{{ formattedBreak.seconds }}</span>
            <span class="text-[10px] text-slate-500 uppercase">seg</span>
          </div>
        </div>
      </div>
    </main>

    <footer class="relative z-10 w-full px-6 py-4 text-center border-t border-white/5 bg-slate-900/50 backdrop-blur-sm">
      <p class="text-xs text-slate-500 text-center">
        Created by <span class="text-teal-500/80">StevenU21</span> • 
        <a href="https://github.com/StevenU21/Flowmodoro" target="_blank" rel="noopener noreferrer" class="hover:text-teal-300 transition-colors underline decoration-slate-700 hover:decoration-teal-500">
          GitHub
        </a>
      </p>
    </footer>

    <div v-if="showInfo" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm transition-opacity" @click.self="toggleInfo">
      <div class="bg-slate-800 border border-slate-700 p-8 rounded-xl max-w-md w-full shadow-2xl relative">
        <button @click="toggleInfo" class="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">✕</button>
        
        <h2 class="text-2xl font-bold text-teal-400 mb-6 tracking-wide">Método Flowmodoro</h2>
        
        <div class="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            <strong class="text-teal-200">1. Enfócate (Flow):</strong>
            A diferencia del Pomodoro, aquí <span class="italic text-white">tú decides</span> cuándo parar. El cronómetro cuenta hacia arriba. Trabaja hasta que te canses.
          </p>
          <p>
            <strong class="text-teal-200">2. Descansa (Ratio 5:1):</strong>
            Por cada 5 minutos de trabajo, ganas 1 minuto de descanso. Ejemplo: 50 min de trabajo = 10 min de descanso.
          </p>
          <p>
            <strong class="text-teal-200">3. Sin Ansiedad:</strong>
            Hemos ocultado los segundos para que "pierdas la noción del tiempo" y entres en Deep Work.
          </p>
        </div>

        <div class="mt-8 pt-4 border-t border-slate-700 text-center">
           <p class="text-xs text-slate-500">"El flow no mira el reloj."</p>
        </div>
      </div>
    </div>

  </div>
</template>

<style>
body {
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
}
</style>
