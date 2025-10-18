import { create } from 'zustand';
import type { SequencerState, StepIndex, PadIndex, CategoryId } from '../types';
import { categoryIds } from '../data/categories';

interface SequencerStore extends SequencerState {
  // Additional state
  mutedCategories: Set<CategoryId>;
  soloedTracks: Record<CategoryId, PadIndex | null>;
  
  // Actions
  setBpm: (bpm: number) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentStep: (step: StepIndex) => void;
  toggleGridCell: (pad: PadIndex, step: StepIndex) => void;
  setActiveCategory: (category: CategoryId) => void;
  toggleCategoryMute: (category: CategoryId) => void;
  setSoloTrack: (category: CategoryId, track: PadIndex | null) => void;
  clearTrack: (category: CategoryId, track: PadIndex) => void;
  setBpmEditMode: (enabled: boolean) => void;
  reset: () => void;
}

const createInitialGrids = () => {
  const grids: Record<CategoryId, boolean[][]> = {} as Record<CategoryId, boolean[][]>;
  categoryIds.forEach(categoryId => {
    grids[categoryId] = Array(12).fill(null).map(() => Array(16).fill(false));
  });
  return grids;
};

export const useSequencerStore = create<SequencerStore>((set) => ({
  // Initial state
  bpm: 120,
  isPlaying: false,
  currentStep: 0,
  grids: createInitialGrids(),
  activeCategory: 'PO-12',
  bpmEditMode: false,
  mutedCategories: new Set<CategoryId>(),
  soloedTracks: categoryIds.reduce((acc, categoryId) => {
    acc[categoryId] = null;
    return acc;
  }, {} as Record<CategoryId, PadIndex | null>),

  // Actions
  setBpm: (bpm) => set({ bpm: Math.max(60, Math.min(200, bpm)) }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  toggleGridCell: (pad, step) => set((state) => {
    const newGrids = { ...state.grids };
    const activeGrid = [...newGrids[state.activeCategory]];
    newGrids[state.activeCategory] = activeGrid;
    activeGrid[pad] = [...activeGrid[pad]];
    activeGrid[pad][step] = !activeGrid[pad][step];
    return { grids: newGrids };
  }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  toggleCategoryMute: (category) => set((state) => {
    const newMutedCategories = new Set(state.mutedCategories);
    if (newMutedCategories.has(category)) {
      newMutedCategories.delete(category);
    } else {
      newMutedCategories.add(category);
    }
    return { mutedCategories: newMutedCategories };
  }),
  setSoloTrack: (category, track) => set((state) => {
    const newSoloedTracks = { ...state.soloedTracks };
    newSoloedTracks[category] = track;
    return { soloedTracks: newSoloedTracks };
  }),
  clearTrack: (category, track) => set((state) => {
    const newGrids = { ...state.grids };
    const categoryGrid = [...newGrids[category]];
    newGrids[category] = categoryGrid;
    categoryGrid[track] = Array(16).fill(false);
    return { grids: newGrids };
  }),
  setBpmEditMode: (bpmEditMode) => set({ bpmEditMode }),
  reset: () => set({
    bpm: 120,
    isPlaying: false,
    currentStep: 0,
    grids: createInitialGrids(),
    activeCategory: 'PO-12',
    bpmEditMode: false,
    mutedCategories: new Set<CategoryId>(),
    soloedTracks: categoryIds.reduce((acc, categoryId) => {
      acc[categoryId] = null;
      return acc;
    }, {} as Record<CategoryId, PadIndex | null>),
  }),
}));
