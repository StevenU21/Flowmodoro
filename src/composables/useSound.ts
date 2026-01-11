export function useSound() {
  const playSound = (soundName: 'start' | 'break' | 'finish' | 'interval') => {

    let audioFile = '';
    
    switch (soundName) {
      case 'start':
        audioFile = '/audio/notification-01.mp3';
        break;
      case 'break':
        audioFile = '/audio/notification-03.mp3';
        break;
      case 'finish':
        audioFile = '/audio/notification-02.mp3';
        break;
      case 'interval':
        audioFile = '/audio/notification-04.mp3';
        break;
    }

    if (audioFile) {
      const audio = new Audio(audioFile);
      audio.play().catch(e => console.log('Audio play failed:', e));
    } else {
      console.log(`[Sound] Playing sound: ${soundName} (File not missing)`);
    }
  };

  return {
    playSound
  };
}
