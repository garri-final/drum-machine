// Feature-flagged Tone.js pitch shift integration
export const enablePitchShift = false; // Set to true to enable Tone.js integration

let pitchShiftNode: any = null;

// Initialize Tone.js pitch shift if enabled
export const initializePitchShift = async (): Promise<void> => {
  if (!enablePitchShift) return;
  
  try {
    const { PitchShift } = await import('tone');
    pitchShiftNode = new PitchShift({
      pitch: 0, // semitones, range -12 to +12
    }).toDestination();
  } catch (error) {
    console.warn('Tone.js not available, pitch shift disabled:', error);
  }
};

// Connect audio node through effects chain
export const connectFxChain = (inputNode: AudioNode): AudioNode => {
  if (!enablePitchShift || !pitchShiftNode) {
    return inputNode;
  }
  
  // Connect input to pitch shift, then to destination
  inputNode.connect(pitchShiftNode);
  return pitchShiftNode;
};

// Get current pitch shift value
export const getPitchShift = (): number => {
  if (!enablePitchShift || !pitchShiftNode) return 0;
  return pitchShiftNode.pitch;
};

// Set pitch shift value
export const setPitchShift = (semitones: number): void => {
  if (!enablePitchShift || !pitchShiftNode) return;
  pitchShiftNode.pitch = Math.max(-12, Math.min(12, semitones));
};
