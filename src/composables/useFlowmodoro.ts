import { ref, computed } from 'vue';

export type FlowMode = 'focus' | 'break' | 'idle';

export function useFlowmodoro() {
  const mode = ref<FlowMode>('idle');
  const startTime = ref<number | null>(null);
  const elapsedTime = ref(0);
  const timerId = ref<number | null>(null);
  const breakRatio = 5;

  const earnedBreakTime = computed(() => {
    return Math.floor(elapsedTime.value / breakRatio);
  });

  const isRunning = computed(() => timerId.value !== null);

  const tick = () => {
    if (startTime.value === null) return;
    
    const now = Date.now();
    if (mode.value === 'focus') {
      elapsedTime.value = now - startTime.value;
    }
    
    timerId.value = requestAnimationFrame(tick);
  };

  const startFocus = () => {
    if (mode.value === 'focus') return;
    
    mode.value = 'focus';
    startTime.value = Date.now() - elapsedTime.value;
    timerId.value = requestAnimationFrame(tick);
  };

  const pause = () => {
    if (timerId.value) {
      cancelAnimationFrame(timerId.value);
      timerId.value = null;
    }
    mode.value = 'idle';
    startTime.value = null;
  };

  const reset = () => {
    pause();
    elapsedTime.value = 0;
    mode.value = 'idle';
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

  return {
    mode,
    elapsedTime,
    earnedBreakTime,
    isRunning,
    startFocus,
    pause,
    reset,
    formatTime,
  };
}
