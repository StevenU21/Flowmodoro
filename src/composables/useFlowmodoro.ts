import { ref, computed, watch } from 'vue';

export enum FlowMode {
  IDLE = 'idle',
  FLOW = 'flow',
  BREAK = 'break'
}

export interface Session {
  id: number;
  duration: number;
  timestamp: number;
}

const STORAGE_KEY = 'flowmodoro_history';

export function useFlowmodoro() {
  const mode = ref<FlowMode>(FlowMode.IDLE);
  const timerId = ref<number | null>(null);
  const startTime = ref<number | null>(null);
  
  const sessionElapsed = ref(0);
  
  // Load history from localStorage if available
  const storedHistory = localStorage.getItem(STORAGE_KEY);
  const history = ref<Session[]>(storedHistory ? JSON.parse(storedHistory) : []);

  // Save to localStorage whenever history changes
  watch(history, (newHistory) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  }, { deep: true });

  const dailyTotal = computed(() => {
    return history.value.reduce((total, session) => total + session.duration, 0);
  });
  
  const breakRatio = 5;
  const storedBank = localStorage.getItem('flowmodoro_break_bank');
  const breakBank = ref(storedBank ? Number(storedBank) : 0);

  watch(breakBank, (newVal) => {
    localStorage.setItem('flowmodoro_break_bank', newVal.toString());
  });

  const isRunning = computed(() => timerId.value !== null);

  let lastTickTime = 0;

  const runTick = () => {
    const now = Date.now();
    if (mode.value === FlowMode.FLOW) {
      if (startTime.value) {
        sessionElapsed.value = now - startTime.value;
      }
    } else if (mode.value === FlowMode.BREAK) {
      const delta = now - lastTickTime;
      if (delta > 0) {
         breakBank.value = Math.max(0, breakBank.value - delta);
         lastTickTime = now;
      }
      
      if (breakBank.value <= 0) {
        stopBreak();
        return;
      }
    }
    
    timerId.value = requestAnimationFrame(runTick);
  };

  const startFlow = () => {
    if (mode.value === FlowMode.FLOW) return;
    mode.value = FlowMode.FLOW;
    
    startTime.value = Date.now() - sessionElapsed.value;
    timerId.value = requestAnimationFrame(runTick);
  };

  const stopFlowAndBank = () => {
     if (mode.value !== FlowMode.FLOW) return;
     if (sessionElapsed.value === 0) return;

     // Stop the timer first
     if (timerId.value) {
       cancelAnimationFrame(timerId.value);
       timerId.value = null;
     }

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
    mode.value = FlowMode.BREAK;
    lastTickTime = Date.now();
    timerId.value = requestAnimationFrame(runTick);
  };

  const stopBreak = () => {
    if (timerId.value) cancelAnimationFrame(timerId.value);
    timerId.value = null;
    mode.value = FlowMode.IDLE;
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
