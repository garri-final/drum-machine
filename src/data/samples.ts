import type { SampleDef } from '../types';

// Limit to first 8 samples for 8 dedicated tracks
export const samples: SampleDef[] = [
  { id: 0, name: "Kick 1", url: "/samples/pad01.wav", key: "z" },
  { id: 1, name: "Snare 1", url: "/samples/pad02.wav", key: "x" },
  { id: 2, name: "Hi-Hat 1", url: "/samples/pad03.wav", key: "c" },
  { id: 3, name: "Crash 1", url: "/samples/pad04.wav", key: "v" },
  { id: 4, name: "Kick 2", url: "/samples/pad05.wav", key: "a" },
  { id: 5, name: "Snare 2", url: "/samples/pad06.wav", key: "s" },
  { id: 6, name: "Hi-Hat 2", url: "/samples/pad07.wav", key: "d" },
  { id: 7, name: "Crash 2", url: "/samples/pad08.wav", key: "f" },
];

// Controls mapping for 5x5 grid
export const controlsMap = {
  'bpm-edit': { row: 1, col: 3, type: 'button', action: 'toggle-bpm-edit' },
  'bpm-knob': { row: 1, col: 4, type: 'knob', action: 'adjust-bpm' },
  'play': { row: 4, col: 5, type: 'button', action: 'play' },
  'stop': { row: 5, col: 5, type: 'button', action: 'stop' },
} as const;
