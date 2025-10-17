// Lazy AudioContext initialization and management
let audioContext: AudioContext | null = null;

export const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const resumeAudioContext = async (): Promise<void> => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
};

export const getCurrentTime = (): number => {
  return getAudioContext().currentTime;
};
