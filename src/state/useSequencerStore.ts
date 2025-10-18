import { create } from 'zustand';
import type { SequencerState, StepIndex, PadIndex } from '../types';

interface SequencerStore extends SequencerState {
  // Actions
  setBpm: (bpm: number) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentStep: (step: StepIndex) => void;
  toggleGridCell: (pad: PadIndex, step: StepIndex) => void;
  setBpmEditMode: (enabled: boolean) => void;
  reset: () => void;
}

const initialGrid = Array(16).fill(null).map(() => Array(16).fill(false));

export const useSequencerStore = create<SequencerStore>((set) => ({
  // Initial state
  bpm: 120,
  isPlaying: false,
  currentStep: 0,
  grid: initialGrid,
  bpmEditMode: false,

  // Actions
  setBpm: (bpm) => set({ bpm: Math.max(60, Math.min(200, bpm)) }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  toggleGridCell: (pad, step) => set((state) => {
    const newGrid = [...state.grid];
    newGrid[pad] = [...newGrid[pad]];
    newGrid[pad][step] = !newGrid[pad][step];
    return { grid: newGrid };
  }),
  setBpmEditMode: (bpmEditMode) => set({ bpmEditMode }),
  reset: () => set({
    bpm: 120,
    isPlaying: false,
    currentStep: 0,
    grid: initialGrid,
    bpmEditMode: false,
  }),
}));
