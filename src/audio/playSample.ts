import { getAudioContext } from './audioContext';
import { connectFxChain } from './pitchShift';

export const playSample = (buffer: AudioBuffer, volume: number = 1.0): void => {
  const audioContext = getAudioContext();
  
  // Create source node
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  
  // Create gain node
  const gainNode = audioContext.createGain();
  gainNode.gain.value = volume;
  
  // Connect: source -> gain -> fx chain -> destination
  source.connect(gainNode);
  const outputNode = connectFxChain(gainNode);
  outputNode.connect(audioContext.destination);
  
  // Start playback
  source.start();
};
