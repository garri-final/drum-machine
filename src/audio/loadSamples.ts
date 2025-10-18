import type { SampleDef } from '../types';
import { getAudioContext } from './audioContext';

export const loadSamples = async (samples: SampleDef[]): Promise<SampleDef[]> => {
  const audioContext = getAudioContext();
  const loadedSamples: SampleDef[] = [];

  for (const sample of samples) {
    try {
      const response = await fetch(sample.url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      loadedSamples.push({
        ...sample,
        buffer: audioBuffer
      });
    } catch (error) {
      console.error(`Failed to load sample ${sample.name}:`, error);
      // Create a silent buffer as fallback
      const silentBuffer = audioContext.createBuffer(1, 1, audioContext.sampleRate);
      loadedSamples.push({
        ...sample,
        buffer: silentBuffer
      });
    }
  }

  return loadedSamples;
};
