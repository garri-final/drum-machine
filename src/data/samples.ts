import { SampleDef } from '../types';

export const samples: SampleDef[] = [
  { id: 0, name: "Kick 1", url: "/samples/pad01.wav", key: "z" },
  { id: 1, name: "Snare 1", url: "/samples/pad02.wav", key: "x" },
  { id: 2, name: "Hi-Hat 1", url: "/samples/pad03.wav", key: "c" },
  { id: 3, name: "Crash 1", url: "/samples/pad04.wav", key: "v" },
  { id: 4, name: "Kick 2", url: "/samples/pad05.wav", key: "a" },
  { id: 5, name: "Snare 2", url: "/samples/pad06.wav", key: "s" },
  { id: 6, name: "Hi-Hat 2", url: "/samples/pad07.wav", key: "d" },
  { id: 7, name: "Crash 2", url: "/samples/pad08.wav", key: "f" },
  { id: 8, name: "Tom 1", url: "/samples/pad09.wav", key: "q" },
  { id: 9, name: "Tom 2", url: "/samples/pad10.wav", key: "w" },
  { id: 10, name: "Tom 3", url: "/samples/pad11.wav", key: "e" },
  { id: 11, name: "Tom 4", url: "/samples/pad12.wav", key: "r" },
  { id: 12, name: "Perc 1", url: "/samples/pad13.wav", key: "1" },
  { id: 13, name: "Perc 2", url: "/samples/pad14.wav", key: "2" },
  { id: 14, name: "Perc 3", url: "/samples/pad15.wav", key: "3" },
  { id: 15, name: "Perc 4", url: "/samples/pad16.wav", key: "4" },
];

// Controls mapping for 5x5 grid
export const controlsMap = {
  'bpm-edit': { row: 1, col: 3, type: 'button', action: 'toggle-bpm-edit' },
  'bpm-knob': { row: 1, col: 4, type: 'knob', action: 'adjust-bpm' },
  'play': { row: 4, col: 5, type: 'button', action: 'play' },
  'stop': { row: 5, col: 5, type: 'button', action: 'stop' },
} as const;
