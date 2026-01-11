import { ref, computed } from 'vue';

export type FlowMode = 'idle' | 'flow' | 'break';

export interface Session {
  id: number;
  duration: number; // in ms
  timestamp: number;
}

export function useFlowmodoro() {
  const mode = ref<FlowMode>('idle');
  const timerId = ref<number | null>(null);
  const startTime = ref<number | null>(null);
  
  // State: Focus
  const sessionElapsed = ref(0);
  
  // State: History & Totals
  const history = ref<Session[]>([]);
  const dailyTotal = computed(() => {
    return history.value.reduce((total, session) => total + session.duration, 0);
  });
  
  // State: Break
  const breakRatio = 5;
  const breakBank = ref(0); // in ms

  // Helpers
  const isRunning = computed(() => timerId.value !== null);

  const tick = () => {
    if (!startTime.value) return;
    const now = Date.now();

    if (mode.value === 'flow') {
      // Counting UP
      sessionElapsed.value = now - startTime.value;
    } else if (mode.value === 'break') {
      // Counting DOWN
      // We calculate remaining time based on bank when break started
      // But simplifying: just decrement bank for MVP robustly? 
      // Better: startTime is when break started. breakBank is initial bank.
      // currentBank = initialBank - (now - startTime)
      // This allows tab sleeping safely.
      
      // However, we need to know the bank value AT START of break.
      // Let's store that in a temp var implicitly by updating breakBank strictly on stop?
      // No, for drift safety:
      // We need `breakStartTime`. and `startBreakBank`.
      // Let's stick to simple delta subtraction for now to match verified logic style, 
      // OR use the verified timestamp method:
      
      const delta = now - startTime.value;
      // We need to mutate breakBank? 
      // Actually, for a countdown, we display `OriginalBank - Delta`.
      // When we Pause/Stop break, we commit the consumed time.
      
      // Let's implement robust decrement:
      // At tick, calculate meaningful change.
      // For simplicity in this specific "bank" model which persists across flows:
      // It might be easier to just subtract delta from previous frame? No, drift.
      
      // Correct Approach:
      // When break starts -> record `lastTick = Date.now()`.
      // On tick -> `delta = now - lastTick`. `breakBank -= delta`. `lastTick = now`.
      // This handles drift reasonably well for a countdown, provided we handle negative.
      
      /* Re-implementation using LastTick for bank consumption */
      // Using a separate "lastTick" ref would be cleaner than repurposing startTime for everything if logic diverges.
      // But let's use the simplest: 
      // Flow: Elapsed = Now - Start
      // Break: Bank = Bank - (Now - Last) <-- requires stateful tick
    }
  };
  
  // We need a clearer Tick for Break vs Flow
  // Let's separate the logic slightly inside tick.
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
        // Break over logic could go here (alarm, etc)
        // For now just stay at 0
      }
    }
    
    timerId.value = requestAnimationFrame(runTick);
  };

  const startFlow = () => {
    if (mode.value === 'flow') return;
    mode.value = 'flow';
    
    // Resume or Start logic
    // If we have sessionElapsed, we treat it as resume? 
    // Spec says "Timer resets to 0 on new cycle" but "Pause" implies resuming.
    // Let's support Pause/Resume for Flow. Transaction (Stop) is separate.
    
    startTime.value = Date.now() - sessionElapsed.value;
    timerId.value = requestAnimationFrame(runTick);
  };

  const stopFlowAndBank = () => {
     if (mode.value !== 'flow' && mode.value !== 'idle') return; // Can only bank if we were working or paused working
     if (sessionElapsed.value === 0) return;

     // 1. Add to daily total & History
     const sessionTime = sessionElapsed.value;
     history.value.push({
       id: Date.now(),
       duration: sessionTime,
       timestamp: Date.now()
     });

     // 2. Calculate Bank
     const earned = Math.floor(sessionTime / breakRatio);
     breakBank.value += earned;

     // 3. Reset Session
     sessionElapsed.value = 0;
     startTime.value = null;
     
     // 4. Transition to Break Mode implies we are ready to break, 
     // but usually user clicks "Register Break" -> enters Break mode immediately?
     // OR they enter an "Idle Break" state where they can choose to start countdown?
     // Requirement: "Transition: Cambiar estado a STATE_BREAK. Start: Iniciar... (cuenta regresiva)"
     // So we auto-start break.
     
     startBreak();
  };

  const startBreak = () => {
    mode.value = 'break';
    lastTickTime = Date.now(); // Initialize for delta calc
    timerId.value = requestAnimationFrame(runTick);
  };

  const stopBreak = () => {
    // Pause break countdown? or Stop and go to Idle?
    // Usually "Start New Flow" button triggers this.
    if (timerId.value) cancelAnimationFrame(timerId.value);
    timerId.value = null;
    mode.value = 'idle';
  };

  // Generic pause (mostly for flow, but safety for all)
  const pause = () => {
    if (timerId.value) {
      cancelAnimationFrame(timerId.value);
      timerId.value = null;
    }
    // If in flow, we stay in flow mode but timer stops (UI shows "Paused" or just stops)
    // If in break, we pause countdown.
  };
  
  // Format helper
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
    stopBreak, // Effectively "Exit Break / Ready for new flow"
    pause,
    formatTime,
    formatHours,
    addFiveMinutes
  };
}
