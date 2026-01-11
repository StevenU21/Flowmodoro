<script setup lang="ts">
import { useFlowmodoro } from './composables/useFlowmodoro';
import { ref, computed } from 'vue';

const {
  mode,
  sessionElapsed,
  breakBank,
  dailyTotal,
  history,
  isRunning,
  startFlow,
  stopFlowAndBank,
  stopBreak,
  pause,
  formatTime,
  formatHours,
  addFiveMinutes
} = useFlowmodoro();

// Formatters
const formattedSession = computed(() => formatTime(sessionElapsed.value));
const formattedBreak = computed(() => formatTime(breakBank.value));
const formattedTotal = computed(() => formatHours(dailyTotal.value));

// UI State Helpers
const timerOpacity = computed(() => isRunning.value ? 'opacity-100' : 'opacity-80');
const deepWorkLabelClass = computed(() => isRunning.value ? 'opacity-50' : 'opacity-30');

// Header Text Logic
const headerText = computed(() => {
  if (mode.value === 'break') return 'Modo Descanso';
  if (mode.value === 'flow') return 'Modo Enfoque';
  return 'Listo para el Flow';
});

// Modal Logic
const showInfo = ref(false);
const toggleInfo = () => showInfo.value = !showInfo.value;
</script>

<template>
  <div class="flex flex-col min-h-screen bg-slate-900 text-teal-500 font-mono selection:bg-teal-500 selection:text-slate-900 transition-colors duration-700 relative overflow-hidden">
    
    <!-- Background Gradient -->
    <div class="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 pointer-events-none"></div>

    <!-- Header -->
    <header class="relative z-10 w-full px-6 py-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm border-b border-white/5">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-bold tracking-widest text-teal-400">Flowmodoro</h1>
        <div class="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
           <span class="text-xs text-slate-400 uppercase tracking-wider">Total Hoy:</span>
           <span class="text-sm font-bold text-teal-300">{{ formattedTotal }}</span>
        </div>
      </div>
      
      <button 
        @click="toggleInfo"
        class="text-sm text-slate-400 hover:text-teal-300 transition-colors flex items-center gap-2 group"
      >
        <span>¿Cómo funciona?</span>
        <span class="w-5 h-5 flex items-center justify-center border border-slate-600 rounded-full group-hover:border-teal-300">?</span>
      </button>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 flex-grow flex flex-col items-center justify-center">
      
      <!-- Status Label -->
      <div :class="['text-xs tracking-[0.2em] uppercase transition-opacity duration-700 mb-8', deepWorkLabelClass]">
        {{ headerText }}
      </div>

      <!-- Main Timer Display (Switches based on Mode) -->
      <div :class="['flex items-baseline mb-12 transition-opacity duration-700', timerOpacity]">
        
        <!-- FLOW MODE: Count UP, No Seconds -->
        <span v-if="mode !== 'break'" class="text-[12rem] leading-none font-bold text-slate-100 tracking-tighter drop-shadow-2xl">
          {{ formattedSession.minutes }}
        </span>

        <!-- BREAK MODE: Standard MM:SS format for mental consistency -->
        <div v-else class="flex items-baseline">
           <span class="text-[12rem] leading-none font-bold text-teal-400 tracking-tighter drop-shadow-2xl animate-pulse">
             {{ formattedBreak.minutes }}
           </span>
           <span class="text-[8rem] leading-none font-bold text-teal-400/50 tracking-tighter mx-2">:</span>
           <span class="text-[12rem] leading-none font-bold text-teal-400 tracking-tighter drop-shadow-2xl animate-pulse">
             {{ formattedBreak.seconds }}
           </span>
        </div>
      </div>

      <!-- Controls Configuration -->
      <div class="flex gap-4 mb-16">
        
        <!-- IDLE / PAUSED FLOW -->
        <button 
          v-if="mode === 'idle'" 
          @click="startFlow"
          class="px-8 py-3 bg-teal-600 text-slate-900 font-bold rounded hover:bg-teal-500 transition-all transform hover:scale-105 shadow-lg shadow-teal-500/20"
        >
          {{ sessionElapsed > 0 ? 'REANUDAR' : 'INICIAR FLOW' }}
        </button>

        <!-- IN FLOW -->
        <div v-if="mode === 'flow'" class="flex gap-4">
           <button @click="pause" class="px-6 py-3 border border-slate-700 text-slate-400 hover:text-white rounded">
             PAUSAR
           </button>
           <button 
             @click="stopFlowAndBank"
             class="px-8 py-3 border border-teal-500 text-teal-400 font-bold rounded hover:bg-teal-900/50 transition-all"
           >
             REGISTRAR DESCANSO
           </button>
        </div>

        <!-- IN BREAK -->
        <div v-if="mode === 'break'" class="flex flex-col items-center gap-2">
           <button 
             @click="stopBreak"
             class="px-8 py-3 bg-slate-700 text-slate-200 font-bold rounded hover:bg-slate-600 transition-all"
           >
             SALTAR DESCANSO
           </button>
           <span class="text-[10px] text-slate-600 uppercase tracking-wide">
             (Tiempo restante se pierde)
           </span>
        </div>
      </div>

      <!-- Session History (Velocity) -->
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
    </main>

    <!-- Footer -->
    <footer class="relative z-10 w-full px-6 py-4 text-center border-t border-white/5 bg-slate-900/50 backdrop-blur-sm">
      <p class="text-xs text-slate-500 text-center">
        Created by <span class="text-teal-500/80">StevenU21</span> • 
        <a href="https://github.com/StevenU21/Flowmodoro" target="_blank" rel="noopener noreferrer" class="hover:text-teal-300 transition-colors underline decoration-slate-700 hover:decoration-teal-500">
          GitHub
        </a>
      </p>
    </footer>

    <!-- Info Modal -->
    <div v-if="showInfo" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm transition-opacity" @click.self="toggleInfo">
      <div class="bg-slate-800 border border-slate-700 p-8 rounded-xl max-w-md w-full shadow-2xl relative">
        <button @click="toggleInfo" class="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">✕</button>
        
        <h2 class="text-2xl font-bold text-teal-400 mb-6 tracking-wide">Método Flowmodoro</h2>
        
        <div class="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            <strong class="text-teal-200">1. Enfócate (Flow):</strong>
            El cronómetro cuenta hacia arriba. Trabaja hasta cansarte.
          </p>
          <p>
            <strong class="text-teal-200">2. Descansa (Ratio 5:1):</strong>
            5 min trabajo = 1 min descanso. El tiempo se acumula en el "Banco".
          </p>
          <p>
            <strong class="text-teal-200">3. Nuevo Ciclo:</strong>
            Al registrar descanso, tu tiempo se guarda en el historial y comienza la cuenta regresiva.
          </p>
          
          <div class="border-t border-slate-700 pt-4 mt-4">
            <p class="text-slate-400 text-xs leading-relaxed">
              <strong class="text-slate-300">Límite Cognitivo:</strong>
              La investigación muestra que el cerebro solo puede sostener 4-6 horas de aprendizaje profundo real por día. 
              Más allá de esto, la calidad del trabajo cae drásticamente.
            </p>
            <a 
              href="https://graphics8.nytimes.com/images/blogs/freakonomics/pdf/DeliberatePractice(PsychologicalReview).pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-teal-400 hover:text-teal-300 text-xs underline decoration-teal-500/30 hover:decoration-teal-300 transition-colors mt-2 inline-block"
            >
              Ver estudio: Deliberate Practice (Ericsson et al.)
            </a>
          </div>
          
          <p class="text-yellow-400/80 text-xs border-l-2 border-yellow-500/30 pl-3">
            <strong>Nota:</strong> Si pausas por más de 15 min, considera registrar la sesión. Las pausas largas rompen el flow.
          </p>
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
