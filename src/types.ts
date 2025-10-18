// Sequencer dimensions
export const NUM_STEPS = 16; // columns
export const NUM_TRACKS = 12; // rows per category
export const NUM_CATEGORIES = 9; // number of sound categories

export type StepIndex = 0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15;
export type PadIndex = 0|1|2|3|4|5|6|7|8|9|10|11;
export type CategoryId = 'PO-12' | 'PO-14' | 'PO-16' | 'PO-20' | 'PO-28' | 'PO-32' | 'PO-33' | 'PO-35' | 'PO-127';

export interface SequencerState {
  bpm: number; // 60..200
  isPlaying: boolean;
  currentStep: StepIndex; // 0..15
  grids: Record<CategoryId, boolean[][]>; // [category][track][step] on/off, size 9×12×16
  activeCategory: CategoryId; // currently selected category
  bpmEditMode: boolean;
}

export interface SampleDef {
  id: PadIndex; // 0..11
  name: string; // e.g., "Kick 1"
  url: string;  // e.g., "/samples/PO-12/pad01.wav"
  key: string;  // e.g., "z"
  category: CategoryId; // which category this sample belongs to
  buffer?: AudioBuffer; // decoded
}

export interface CategoryDef {
  id: CategoryId;
  name: string;
  color: string; // hex color for gradient
  pitchShiftEnabled: boolean; // whether this category should pitch shift with BPM
}

export interface ControlsMap {
  [key: string]: {
    row: number;
    col: number;
    type: 'button' | 'knob' | 'placeholder';
    action?: string;
  };
}
