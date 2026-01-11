<script setup lang="ts">
import { useFlowmodoro, FlowMode } from './composables/useFlowmodoro';
import { ref, computed, watch } from 'vue';
import AppHeader from './components/AppHeader.vue';
import TimerDisplay from './components/TimerDisplay.vue';
import ControlButtons from './components/ControlButtons.vue';
import BreakBankDisplay from './components/BreakBankDisplay.vue';
import SessionHistory from './components/SessionHistory.vue';
import InfoModal from './components/InfoModal.vue';
import AppFooter from './components/AppFooter.vue';

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
  formatHours
} = useFlowmodoro();

const formattedSession = computed(() => formatTime(sessionElapsed.value));
const formattedBreak = computed(() => formatTime(breakBank.value));
const formattedTotal = computed(() => formatHours(dailyTotal.value));

const timerOpacity = computed(() => isRunning.value ? 'opacity-100' : 'opacity-80');
const deepWorkLabelClass = computed(() => isRunning.value ? 'opacity-50' : 'opacity-30');

const headerText = computed(() => {
  if (mode.value === FlowMode.BREAK) return 'Modo Descanso';
  if (mode.value === FlowMode.FLOW) return 'Modo Enfoque';
  return 'Listo para el Flow';
});

const showInfo = ref(false);
const toggleInfo = () => showInfo.value = !showInfo.value;

watch([mode, sessionElapsed, breakBank], () => {
  if (mode.value === FlowMode.FLOW) {
    document.title = `${formattedSession.value.minutes}m - Flowmodoro (Trabajo)`;
  } else if (mode.value === FlowMode.BREAK) {
    document.title = `${formattedBreak.value.minutes}:${formattedBreak.value.seconds} - Flowmodoro (Descanso)`;
  } else {
    document.title = 'Flowmodoro';
  }
});
</script>

<template>
  <div class="flex flex-col min-h-screen bg-slate-900 text-teal-500 font-mono selection:bg-teal-500 selection:text-slate-900 transition-colors duration-700 relative overflow-hidden">
    
    <div class="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 pointer-events-none"></div>

    <AppHeader :dailyTotal="formattedTotal" @openInfo="toggleInfo" />

    <main class="relative z-10 flex-grow flex flex-col items-center justify-center">
      
      <div :class="['text-xs tracking-[0.2em] uppercase transition-opacity duration-700 mb-8', deepWorkLabelClass]">
        {{ headerText }}
      </div>

      <TimerDisplay 
        :mode="mode"
        :formattedMinutes="mode === FlowMode.BREAK ? formattedBreak.minutes : formattedSession.minutes"
        :formattedSeconds="formattedBreak.seconds"
        :opacity="timerOpacity"
      />

      <ControlButtons 
        :mode="mode"
        :isRunning="isRunning"
        :sessionElapsed="sessionElapsed"
        @startFlow="startFlow"
        @pause="pause"
        @stopFlowAndBank="stopFlowAndBank"
        @stopBreak="stopBreak"
      />

      <BreakBankDisplay 
        :minutes="formattedBreak.minutes"
        :seconds="formattedBreak.seconds"
      />
    </main>

    <SessionHistory :history="history" />

    <AppFooter />

    <InfoModal :show="showInfo" @close="toggleInfo" />

  </div>
</template>

<style>
body {
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
}
</style>
