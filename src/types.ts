// Sequencer dimensions
export const NUM_STEPS = 16; // columns
export const NUM_TRACKS = 8; // rows

export type StepIndex = 0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15;
export type PadIndex = 0|1|2|3|4|5|6|7;

export interface SequencerState {
  bpm: number; // 60..200
  isPlaying: boolean;
  currentStep: StepIndex; // 0..15
  grid: boolean[][]; // [track][step] on/off, size 8×16
  bpmEditMode: boolean;
}

export interface SampleDef {
  id: PadIndex; // 0..15
  name: string; // e.g., "Kick 1"
  url: string;  // e.g., "/samples/pad01.wav"
  key: string;  // e.g., "z"
  buffer?: AudioBuffer; // decoded
}

export interface ControlsMap {
  [key: string]: {
    row: number;
    col: number;
    type: 'button' | 'knob' | 'placeholder';
    action?: string;
  };
}
