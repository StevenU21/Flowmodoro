import { ref, computed } from 'vue';

export type FlowMode = 'idle' | 'flow' | 'break';

export interface Session {
  id: number;
  duration: number;
  timestamp: number;
}

export function useFlowmodoro() {
  const mode = ref<FlowMode>('idle');
  const timerId = ref<number | null>(null);
  const startTime = ref<number | null>(null);
  
  const sessionElapsed = ref(0);
  
  const history = ref<Session[]>([]);
  const dailyTotal = computed(() => {
    return history.value.reduce((total, session) => total + session.duration, 0);
  });
  
  const breakRatio = 5;
  const breakBank = ref(0);

  const isRunning = computed(() => timerId.value !== null);

  let lastTickTime = 0;

  const runTick = () => {
    const now = Date.now();
    if (mode.value === 'flow') {
      if (startTime.value) {
        sessionElapsed.value = now - startTime.value;
      }
    } else if (mode.value === 'break') {
      const delta = now - lastTickTime;
      if (delta > 0) {
         breakBank.value = Math.max(0, breakBank.value - delta);
         lastTickTime = now;
      }
      
      if (breakBank.value <= 0) {
      }
    }
    
    timerId.value = requestAnimationFrame(runTick);
  };

  const startFlow = () => {
    if (mode.value === 'flow') return;
    mode.value = 'flow';
    
    startTime.value = Date.now() - sessionElapsed.value;
    timerId.value = requestAnimationFrame(runTick);
  };

  const stopFlowAndBank = () => {
     if (mode.value !== 'flow' && mode.value !== 'idle') return;
     if (sessionElapsed.value === 0) return;

     const sessionTime = sessionElapsed.value;
     history.value.push({
       id: Date.now(),
       duration: sessionTime,
       timestamp: Date.now()
     });

     const earned = Math.floor(sessionTime / breakRatio);
     breakBank.value += earned;

     sessionElapsed.value = 0;
     startTime.value = null;
     
     startBreak();
  };

  const startBreak = () => {
    mode.value = 'break';
    lastTickTime = Date.now();
    timerId.value = requestAnimationFrame(runTick);
  };

  const stopBreak = () => {
    if (timerId.value) cancelAnimationFrame(timerId.value);
    timerId.value = null;
    mode.value = 'idle';
  };

  const pause = () => {
    if (timerId.value) {
      cancelAnimationFrame(timerId.value);
      timerId.value = null;
    }
  };
  
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  };

  const formatHours = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  const addFiveMinutes = () => {
    const fiveMinutesInMs = 5 * 60 * 1000;
    sessionElapsed.value += fiveMinutesInMs;
    if (startTime.value) {
      startTime.value -= fiveMinutesInMs;
    }
  };

  return {
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
  };
}
